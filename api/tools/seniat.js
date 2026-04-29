// api/tools/seniat.js
import express from "express"
import * as cheerio from "cheerio"

export const seniatRouter = express.Router()

const ORIGIN = "http://contribuyente.seniat.gob.ve"
const PAGE = "/BuscaRif/BuscaRif.jsp"
const BASE = ORIGIN + PAGE

const sessions = new Map()
const TTL_MS = 5 * 60 * 1000
const now = () => Date.now()
const rid = () => Math.random().toString(36).slice(2)

function setSession(id, data) { sessions.set(id, { ...data, ts: now() }) }
function getSession(id) {
  const s = sessions.get(id)
  if (!s) return null
  if (now() - s.ts > TTL_MS) { sessions.delete(id); return null }
  return s
}

function buildCookieHeader(resp) {
  let raw = []
  if (typeof resp.headers.getSetCookie === "function") {
    raw = resp.headers.getSetCookie()
  } else if (typeof resp.headers.raw === "function") {
    raw = resp.headers.raw()["set-cookie"] || []
  } else {
    const single = resp.headers.get("set-cookie")
    if (single) raw = [single]
  }

  return raw
    .map(h => String(h).split(";")[0].trim())
    // Filtramos cookies malformadas (el SENIAT a veces envía una cookie "HttpOnly;Secure" sin nombre/valor)
    .filter(h => h && h.includes("="))
    .join("; ")
}

async function textWin1252(resp) {
  const buf = Buffer.from(await resp.arrayBuffer())
  return new TextDecoder("windows-1252").decode(buf)
}

/**
 * Convierte RIF limpio (sin guiones) al formato que muestra el SENIAT.
 * Ej: J000202001 → J-00020200-1
 * Formato VE: [tipo 1 letra][8 dígitos][1 dígito verificador]
 */
function formatRifDashes(rifClean) {
  if (rifClean.length < 2) return rifClean
  const tipo = rifClean[0]
  const digits = rifClean.slice(1)
  if (digits.length === 9) {
    return `${tipo}-${digits.slice(0, 8)}-${digits[8]}`
  }
  return rifClean
}

seniatRouter.post("/lookup", express.json(), async (req, res) => {
  try {
    const { init, sessionId, rif, captcha } = req.body || {}

    if (init) {
      const r = await fetch(BASE, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "text/html,application/xhtml+xml" },
      })
      const cookieHeader = buildCookieHeader(r)
      const html = await textWin1252(r)
      const $ = cheerio.load(html)
      let imgSrc = $("img[src]").toArray().map(el => $(el).attr("src"))
        .find(s => s && /captcha\.jpg/i.test(s)) || "Captcha.jpg"
      const captchaUrl = new URL(imgSrc, BASE).toString()
      const id = rid()
      setSession(id, { cookieHeader, captchaUrl })
      return res.json({ sessionId: id, captchaEndpoint: `/api/tools/seniat/captcha/${id}` })
    }

    if (!sessionId || !rif || !captcha) {
      return res.status(400).json({ error: "Faltan sessionId, rif o captcha." })
    }
    const sess = getSession(sessionId)
    if (!sess) return res.status(410).json({ error: "Sesion expirada. Vuelve a iniciar." })

    const rifClean = String(rif).toUpperCase().replace(/[^A-Z0-9]/g, "")
    const rifDashes = formatRifDashes(rifClean)
    console.log(`[SENIAT] RIF: ${rifClean}  |  Con guiones: ${rifDashes}`)

    const form = new URLSearchParams()
    form.set("p_rif", rifClean)
    form.set("p_cedula", "")
    form.set("codigo", String(captcha))
    form.set("busca", "Buscar")

    const resp = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "Origin": ORIGIN,
        "Referer": BASE,
        "Cookie": sess.cookieHeader,
      },
      body: form.toString(),
    })

    const html = await textWin1252(resp)
    const $ = cheerio.load(html)
    const bodyText = $("body").text().replace(/\s+/g, " ").trim()

    // ── DEBUG: imprime los primeros 1500 chars para inspección ─────────────
    console.log("\n=== SENIAT response (1500 chars) ===")
    console.log(bodyText.slice(0, 1500))
    console.log("===\n")

    // ── Detección de CAPTCHA incorrecto ─────────────────────────────────────
    // Si el SENIAT devuelve texto explícito de error:
    const captchaFailed = /captcha\s*incorrecto|verifique\s*el\s*c[oó]digo/i.test(bodyText)
    
    if (captchaFailed) {
      return res.status(400).json({ error: "CAPTCHA incorrecto. Intenta de nuevo." })
    }
    if (/no\s*aparece\s*registrado|no\s*existe|rif\s*no\s*encontrado/i.test(bodyText)) {
      return res.status(404).json({ error: "RIF no encontrado en el SENIAT." })
    }

    // ── ESTRATEGIA 1: leer tabla <td> ────────────────────────────────────────
    // El SENIAT devuelve algo como:
    //   <td>J-00020200-1</td><td>FARMATODO, C.A.</td><td>...</td>
    let legalName = ""
    const tds = $("td").map((_, el) => $(el).text().replace(/\s+/g, " ").trim()).get()
    console.log("[SENIAT] Celdas <td>:", JSON.stringify(tds.slice(0, 20)))

    const rifVariants = [rifDashes, rifClean, rifDashes.replace(/-/g, "")]
    for (const variant of rifVariants) {
      const idx = tds.findIndex(t =>
        t.replace(/[\s-]/g, "").toUpperCase() === variant.replace(/[\s-]/g, "").toUpperCase()
      )
      if (idx !== -1 && idx + 1 < tds.length) {
        const candidate = tds[idx + 1].replace(/\s+/g, " ").trim()
        // Filtrar valores que no sean nombres (solo números, vacíos, etc.)
        if (candidate && candidate.length > 2 && !/^\d+(\.\d+)?$/.test(candidate)) {
          legalName = candidate
          console.log(`[SENIAT] Nombre por <td> (variante "${variant}"):`, legalName)
          break
        }
      }
    }

    // ── ESTRATEGIA 2: regex con el RIF con guiones ───────────────────────────
    if (!legalName) {
      // Escapar los guiones del RIF formateado para usarlo en regex
      const rifEscaped = rifDashes.replace(/[-]/g, "[-\\s]?")
      const patterns = [
        new RegExp(rifEscaped + "\\s+([A-ZÁÉÍÓÚÑ][^(\n]{3,80}?)\\s*(?:\\(|Actividad|Condicion|\\s{3}|$)", "i"),
        new RegExp(rifClean + "\\s+([^(\n]+?)\\s*(?:\\(|Actividad|Condicion|$)", "i"),
      ]
      for (const pat of patterns) {
        const m = bodyText.match(pat)
        if (m && m[1]) {
          const candidate = m[1].replace(/\s*(Este contribuyente|Actividad|Condicion).*/i, "").trim()
          if (candidate && candidate.length > 2) {
            legalName = candidate
            console.log("[SENIAT] Nombre por regex:", legalName)
            break
          }
        }
      }
    }

    // ── ESTRATEGIA 3: buscar tipo societario (C.A., S.R.L., etc.) ────────────
    if (!legalName) {
      const mRS = bodyText.match(
        /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑA-Za-záéíóúñ\s,.'()-]{2,70}?\s*(?:C\.A\.|S\.R\.L\.|S\.A\.|C\.A\b|COMPAÑIA\s+ANONIMA|SOCIEDAD\s+ANONIMA))/i
      )
      if (mRS) {
        legalName = mRS[1].trim()
        console.log("[SENIAT] Nombre por tipo societario:", legalName)
      }
    }

    console.log("[SENIAT] legalName final:", legalName || "(no encontrado)")

    if (!legalName) {
      return res.status(400).json({
        error: "No se pudo extraer el nombre del contribuyente. Verifica el CAPTCHA o intenta de nuevo."
      })
    }

    // ── Actividad económica ───────────────────────────────────────────────────
    const mAct = bodyText.match(/Actividad\s+Econ.mica\s*:\s*([^\n]+?)(?:\s*Condici|$)/i)
    const activity = mAct ? mAct[1].trim() : ""
    console.log("[SENIAT] activity:", activity)

    // ── Tipo de contribuyente ─────────────────────────────────────────────────
    // Solo es Especial si la búsqueda del RIF dice específicamente:
    // "Condición: Contribuyente Ordinario del IVA y Agente de Retención del IVA"
    const isAgent = /contribuyente\s+ordinario\s+del\s+iva\s+y\s+agente\s+de\s+retenci[oó]n\s+del\s+iva/i.test(bodyText)
    const contribType = isAgent ? "Especial" : "Ordinario"
    console.log("[SENIAT] isAgent:", isAgent, "contribType:", contribType)

    // ── Porcentaje de retención de IVA ────────────────────────────────────────
    const mPct = bodyText.match(/retenci.n\s+del\s+(\d+)\s*%/i)
    const vatRetention = mPct ? Number(mPct[1]) : (isAgent ? 75 : 100)
    console.log("[SENIAT] vatRetention:", vatRetention)

    return res.json({ rif: rifClean, legalName, contribType, vatRetention, activity })

  } catch (e) {
    console.error("SENIAT lookup error:", e)
    return res.status(500).json({ error: "No se pudo consultar el RIF en SENIAT." })
  }
})

seniatRouter.get("/captcha/:id", async (req, res) => {
  try {
    const sess = getSession(req.params.id)
    if (!sess) return res.status(410).end("Sesion expirada")
    const url = new URL(sess.captchaUrl)
    url.searchParams.set("t", Date.now().toString())
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": BASE,
        "Cookie": sess.cookieHeader,
        "Accept": "image/*,*/*;q=0.8",
      },
    })
    const ct = r.headers.get("content-type") || "image/jpeg"
    const buf = Buffer.from(await r.arrayBuffer())
    res.setHeader("Content-Type", ct)
    res.setHeader("Cache-Control", "no-store")
    res.send(buf)
  } catch (e) {
    console.error("captcha error:", e)
    res.status(500).end("No se pudo obtener el captcha")
  }
})
