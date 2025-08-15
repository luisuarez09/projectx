// api/tools/seniat.js
import express from "express"
import * as cheerio from "cheerio"

export const seniatRouter = express.Router()

// ====== Constantes de la página SENIAT ======
const ORIGIN = "http://contribuyente.seniat.gob.ve"
const PAGE = "/BuscaRif/BuscaRif.jsp"
const BASE = ORIGIN + PAGE

// ====== Sesiones simples en memoria ======
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

// Extrae pares "cookie=value" desde Set-Cookie
function buildCookieHeader(resp) {
  let raw = []
  if (typeof resp.headers.raw === "function") {
    raw = resp.headers.raw()["set-cookie"] || []
  } else {
    const single = resp.headers.get("set-cookie")
    if (single) raw = [single]
  }
  const pairs = raw.map(h => String(h).split(";")[0]).filter(Boolean)
  return pairs.join("; ")
}

// Decodifica Windows-1252 correctamente
async function textWin1252(resp) {
  const buf = Buffer.from(await resp.arrayBuffer())
  const dec = new TextDecoder("windows-1252")
  return dec.decode(buf)
}

/**
 * POST /api/tools/seniat/lookup
 *  - { init: true } -> crea sesión y devuelve { sessionId, captchaEndpoint }
 *  - { sessionId, rif, captcha } -> consulta y devuelve datos
 */
seniatRouter.post("/lookup", express.json(), async (req, res) => {
  try {
    const { init, sessionId, rif, captcha } = req.body || {}

    // STEP 1: iniciar sesión y exponer endpoint del captcha
    if (init) {
      const r = await fetch(BASE, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html,application/xhtml+xml",
        },
      })
      const cookieHeader = buildCookieHeader(r)
      const html = await textWin1252(r)
      const $ = cheerio.load(html)

      // En el HTML real: <img src="Captcha.jpg">
      let imgSrc = $("img[src]").toArray().map(el => $(el).attr("src"))
        .find(s => s && /captcha\.jpg/i.test(s)) || "Captcha.jpg"

      // URL absoluta del captcha
      const captchaUrl = new URL(imgSrc, BASE).toString()
      const id = rid()
      setSession(id, { cookieHeader, captchaUrl })

      return res.json({
        sessionId: id,
        captchaEndpoint: `/api/tools/seniat/captcha/${id}`,
      })
    }

    // STEP 2: consulta por RIF + captcha
    if (!sessionId || !rif || !captcha) {
      return res.status(400).json({ error: "Faltan sessionId, rif o captcha." })
    }
    const sess = getSession(sessionId)
    if (!sess) return res.status(410).json({ error: "Sesión expirada. Vuelve a iniciar." })

    const rifClean = String(rif).toUpperCase().replaceAll(/[^A-Z0-9]/g, "")

    const form = new URLSearchParams()
    form.set("p_rif", rifClean)
    form.set("p_cedula", "")    // dejamos vacío para evitar ambigüedad
    form.set("codigo", String(captcha))
    // el form en la web trae un botón name="busca"; a veces es requerido:
    form.set("busca", "Buscar")

    const resp = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "Origin": ORIGIN,
        "Referer": BASE,
        "Cookie": sess.cookieHeader,   // solo pares cookie=value
      },
      body: form.toString(),
    })

    const html = await textWin1252(resp)
    const $ = cheerio.load(html)
    const bodyText = $("body").text().replace(/\s+/g, " ").trim()

    // Heurísticas de extracción
    const grab = (labels) => {
      const rx = new RegExp(`(?:${labels})\\s*:\\s*([^|\\n<]+)`, "i")
      const m = bodyText.match(rx)
      return m ? m[1].trim() : ""
    }

    const legalName   = grab("Nombre o Razón Social|Denominación")
    const contribType = grab("Tipo de Contribuyente")
    const activity    = grab("Actividad Económica|Actividad Principal")

    // Mensajes comunes de error
    if (/captcha\s*incorrecto|verifique\s*el\s*c[oó]digo/i.test(bodyText)) {
      return res.status(400).json({ error: "CAPTCHA incorrecto." })
    }
    if (/no\s*aparece\s*registrado|no\s*existe/i.test(bodyText)) {
      return res.status(404).json({ error: "RIF no encontrado." })
    }

    // Si no logramos extraer nada, devolvemos un hint para inspección
    if (!legalName && !contribType && !activity) {
      return res.status(200).json({
        rif: rifClean,
        legalName: "",
        contribType: "",
        activity: "",
        raw: { sample: bodyText.slice(0, 600) }
      })
    }

    return res.json({
      rif: rifClean,
      legalName,
      contribType,
      activity,
    })
  } catch (e) {
    console.error("SENIAT lookup error:", e)
    return res.status(500).json({ error: "No se pudo consultar el RIF en SENIAT." })
  }
})

/**
 * GET /api/tools/seniat/captcha/:id
 * Stream de la imagen del captcha con la cookie correcta.
 */
seniatRouter.get("/captcha/:id", async (req, res) => {
  try {
    const sess = getSession(req.params.id)
    if (!sess) return res.status(410).end("Sesion expirada")

    // Evita caché del navegador
    const url = new URL(sess.captchaUrl)
    url.searchParams.set("t", Date.now().toString())

    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": BASE,
        "Cookie": sess.cookieHeader,
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
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