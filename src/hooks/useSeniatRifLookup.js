// src/hooks/useSeniatRifLookup.js
import { useState } from "react"
import { initSeniatSession, lookupRif } from "@/lib/seniat"

export function useSeniatRifLookup() {
  const [sessionId, setSessionId] = useState("")
  const [captchaDataUrl, setCaptchaDataUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function start() {
    setError("")
    setLoading(true)
    try {
      const { sessionId, captchaDataUrl } = await initSeniatSession()
      setSessionId(sessionId)
      setCaptchaDataUrl(captchaDataUrl)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function submit({ rif, captcha }) {
    setError("")
    setLoading(true)
    try {
      const data = await lookupRif({ sessionId, rif, captcha })
      return data
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { start, submit, sessionId, captchaDataUrl, loading, error, reset: () => { setSessionId(""); setCaptchaDataUrl("") } }
}