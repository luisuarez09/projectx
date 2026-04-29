/* eslint-env node */
/* global process */
// api/seniat-server.js
// Servidor mínimo SOLO para consultas SENIAT — sin Prisma ni base de datos.
// Corre en el mismo puerto 4000 que espera el proxy de Vite.

import express from "express"
import cors from "cors"
import { seniatRouter } from "./tools/seniat.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => res.json({ ok: true }))
app.use("/api/tools/seniat", seniatRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`SENIAT server listo: http://localhost:${PORT}`))
