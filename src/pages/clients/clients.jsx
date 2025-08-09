// src/pages/clients.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const API = "/api/clients";

function requireJson(resp) {
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Respuesta no es JSON");
  return resp.json();
}

export default function Clients() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Edit/Delete
  const [editingId, setEditingId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await fetch(API).then(requireJson);
      setList(data);
      setError("");
    } catch (e) {
      setError("No se pudo cargar la lista de clientes.");
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setName("");
    setTaxId("");
    setFiscalAddress("");
    setContactName("");
    setContactRole("");
    setContactPhone("");
    setEditingId(null);
  }

  async function addOrUpdateClient() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = { name, taxId, fiscalAddress, contactName, contactRole, contactPhone };

    try {
      if (editingId) {
        const updated = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then(requireJson);
        setList(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      } else {
        const created = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then(requireJson);
        setList(prev => [created, ...prev]);
      }
      clearForm();
      setError("");
    } catch (e) {
      setError("Hubo un problema guardando el cliente.");
    } finally {
      setSaving(false);
    }
  }

  function onEdit(c) {
    setEditingId(c.id);
    setName(c.name || "");
    setTaxId(c.taxId || "");
    setFiscalAddress(c.fiscalAddress || "");
    setContactName(c.contactName || "");
    setContactRole(c.contactRole || "");
    setContactPhone(c.contactPhone || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onAskDelete(id) {
    setDeleteId(id);
    setOpenDelete(true);
  }

  async function onConfirmDelete() {
    try {
      await fetch(`${API}/${deleteId}`, { method: "DELETE" }).then(requireJson);
      setList(prev => prev.filter(c => c.id !== deleteId));
      if (editingId === deleteId) clearForm();
      setError("");
    } catch (e) {
      setError("No se pudo eliminar el cliente.");
    } finally {
      setOpenDelete(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar cliente" : "Agregar cliente"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Nombre de la empresa *" value={name} onChange={e=>setName(e.target.value)} />
            <Input placeholder="RIF / NIT" value={taxId} onChange={e=>setTaxId(e.target.value)} />
            <Input placeholder="Dirección fiscal" value={fiscalAddress} onChange={e=>setFiscalAddress(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Persona de contacto" value={contactName} onChange={e=>setContactName(e.target.value)} />
            <Input placeholder="Cargo" value={contactRole} onChange={e=>setContactRole(e.target.value)} />
            <Input placeholder="Número de teléfono" inputMode="tel" value={contactPhone} onChange={e=>setContactPhone(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={addOrUpdateClient} disabled={saving}>
              {editingId ? (saving ? "Actualizando..." : "Actualizar") : (saving ? "Agregando..." : "Agregar")}
            </Button>
            <Button variant="secondary" onClick={clearForm} disabled={saving}>Limpiar</Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Listado de clientes</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>RIF / NIT</TableHead>
                  <TableHead>Dirección fiscal</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No hay clientes registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.taxId || "—"}</TableCell>
                      <TableCell className="max-w-[280px] truncate" title={c.fiscalAddress}>
                        {c.fiscalAddress || "—"}
                      </TableCell>
                      <TableCell>{c.contactName || "—"}</TableCell>
                      <TableCell>{c.contactRole || "—"}</TableCell>
                      <TableCell>{c.contactPhone || "—"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="secondary" size="sm" onClick={()=>onEdit(c)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={()=>onAskDelete(c.id)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal confirmación */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta empresa?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}