/* eslint-env node */
/* global process */
// api/index.js  (ESM)
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ===== CLIENTS CRUD =====

// Listar
app.get("/api/clients", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const take = Math.min(Number(req.query.limit ?? 20), 100);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { taxId: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const clients = await prisma.client.findMany({
    where,
    take,
    orderBy: { name: "asc" },
    select: { id: true, name: true, taxId: true },
  });

  res.json(clients);
});

// Crear
app.post("/api/clients", async (req, res) => {
    try {
        const { name, taxId, fiscalAddress, contactName, contactRole, contactPhone } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: "El nombre es obligatorio" });

        const created = await prisma.client.create({
            data: {
                name: name.trim(),
                taxId: taxId || null,
                fiscalAddress: fiscalAddress || null,
                contactName: contactName || null,
                contactRole: contactRole || null,
                contactPhone: contactPhone || null,
            },
        });
        res.status(201).json(created);
    } catch (err) {
        console.error("POST /api/clients", err);
        res.status(500).json({ error: "Error creando cliente" });
    }
});

// Actualizar
app.put("/api/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, taxId, fiscalAddress, contactName, contactRole, contactPhone } = req.body;

        const updated = await prisma.client.update({
            where: { id },
            data: {
                name,
                taxId: taxId ?? null,
                fiscalAddress: fiscalAddress ?? null,
                contactName: contactName ?? null,
                contactRole: contactRole ?? null,
                contactPhone: contactPhone ?? null,
            },
        });
        res.json(updated);
    } catch (err) {
        console.error("PUT /api/clients/:id", err);
        if (err.code === "P2025") return res.status(404).json({ error: "Cliente no encontrado" });
        res.status(500).json({ error: "Error actualizando cliente" });
    }
});

// Eliminar
app.delete("/api/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.client.delete({ where: { id } });
        res.json({ success: true });
    } catch (err) {
        console.error("DELETE /api/clients/:id", err);
        if (err.code === "P2025") return res.status(404).json({ error: "Cliente no encontrado" });
        res.status(500).json({ error: "Error eliminando cliente" });
    }
});

app.get("/api/estimates", async (req, res) => {
    const data = await prisma.estimate.findMany({
        orderBy: [{ year: "desc" }, { number: "desc" }],
        include: { client: true, items: true },
    });
    res.json(data);
});

app.get("/api/estimates/:id", async (req, res) => {
    const id = Number(req.params.id);
    const est = await prisma.estimate.findUnique({
        where: { id },
        include: { client: true, items: true },
    });
    if (!est) return res.status(404).json({ message: "Not found" });
    res.json(est);
});

// Utilidad de cálculo
function computeTotals({ items, taxRate = 0, discountRate = 0 }) {
    const subtotal = items.reduce((acc, it) => acc + Number(it.qty) * Number(it.unitPrice), 0);
    const discountAmt = subtotal * (Number(discountRate) / 100);
    const taxedBase = subtotal - discountAmt;
    const taxAmount = taxedBase * (Number(taxRate) / 100);
    const total = taxedBase + taxAmount;
    // lineTotals
    const withLineTotals = items.map((it) => ({
        ...it,
        lineTotal: Number(it.qty) * Number(it.unitPrice),
    }));
    return { subtotal, discountAmt, taxAmount, total, items: withLineTotals };
}

// correlativo por año
async function nextNumberForYear(year) {
    const last = await prisma.estimate.findFirst({
        where: { year },
        orderBy: { number: "desc" },
        select: { number: true },
    });
    return (last?.number ?? 0) + 1;
}

app.post("/api/estimates", async (req, res) => {
    try {
        const {
            clientId, date, currency = "USD", exchangeRate = null,
            items = [], notes = "", taxRate = 0, discountRate = 0, year,
            number // opcional; si no viene, se autogenera
        } = req.body;

        if (!clientId || !items.length) {
            return res.status(400).json({ message: "clientId e items son requeridos" });
        }

        const y = year || new Date(date ?? Date.now()).getFullYear();
        const num = number ?? (await nextNumberForYear(y));

        const computed = computeTotals({ items, taxRate, discountRate });

        const created = await prisma.estimate.create({
            data: {
                clientId,
                date: date ? new Date(date) : undefined,
                currency,
                exchangeRate,
                notes,
                taxRate,
                discountRate,
                subtotal: computed.subtotal,
                discountAmt: computed.discountAmt,
                taxAmount: computed.taxAmount,
                total: computed.total,
                year: y,
                number: num,
                items: {
                    create: computed.items.map((it, idx) => ({
                        idx: idx + 1,
                        description: it.description,
                        qty: it.qty,
                        unit: it.unit ?? null,
                        unitPrice: it.unitPrice,
                        lineTotal: it.lineTotal,
                    })),
                },
            },
            include: { items: true },
        });

        res.status(201).json(created);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error al crear presupuesto" });
    }
});

app.put("/api/estimates/:id", async (req, res) => {
    const id = Number(req.params.id);
    const {
        clientId, date, currency, exchangeRate, items = [],
        notes, taxRate = 0, discountRate = 0
    } = req.body;

    try {
        const computed = computeTotals({ items, taxRate, discountRate });

        // Estrategia simple: borrar items y recrear
        await prisma.estimateItem.deleteMany({ where: { estimateId: id } });

        const updated = await prisma.estimate.update({
            where: { id },
            data: {
                clientId,
                date: date ? new Date(date) : undefined,
                currency,
                exchangeRate,
                notes,
                taxRate,
                discountRate,
                subtotal: computed.subtotal,
                discountAmt: computed.discountAmt,
                taxAmount: computed.taxAmount,
                total: computed.total,
                items: {
                    create: computed.items.map((it, idx) => ({
                        idx: idx + 1,
                        description: it.description,
                        qty: it.qty,
                        unit: it.unit ?? null,
                        unitPrice: it.unitPrice,
                        lineTotal: it.lineTotal,
                    })),
                },
            },
            include: { items: true },
        });

        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error al actualizar presupuesto" });
    }
});

app.delete("/api/estimates/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.estimateItem.deleteMany({ where: { estimateId: id } });
        await prisma.estimate.delete({ where: { id } });
        res.status(204).end();
    } catch (err) {
        console.error("DELETE /api/estimates/:id", err);
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Presupuesto no encontrado" });
        }
        res.status(500).json({ error: "Error eliminando presupuesto" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API lista: http://localhost:${PORT}`));