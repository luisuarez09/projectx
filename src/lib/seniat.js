// src/lib/seniat.js
export async function initSeniatSession() {
  const r = await fetch("/api/tools/seniat/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ init: true })
  })
  if (!r.ok) throw new Error("No se pudo iniciar sesión con SENIAT.")
  return r.json() // { sessionId, captchaDataUrl }
}

export async function lookupRif({ sessionId, rif, captcha }) {
  const r = await fetch("/api/tools/seniat/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, rif, captcha })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error || "Fallo la consulta.")
  return data // { rif, legalName, contribType, activity }
}