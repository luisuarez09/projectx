import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * ClientPicker shows a list of clients fetched from `/api/clients`.
 *
 * Props:
 * - value: selected client id (number)
 * - onChange: callback(id, clientObject)
 * - placeholder: optional placeholder text
 */
export default function ClientPicker({ value, onChange, placeholder }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/clients");
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error("ClientPicker", err);
      }
    }
    load();
  }, []);

  const handleChange = (val) => {
    const id = Number(val);
    const clientObj = clients.find((c) => c.id === id);
    onChange?.(id, clientObj);
  };

  return (
    <Select value={value ? String(value) : undefined} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {clients.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
