import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Table from "../components/Table";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const seed = [
  { id: 1, regNumber: "GJ01AB4521", name: "VAN-05", type: "Van", maxCapacity: 500, odometer: 74000, acquisitionCost: 620000, status: "Available" },
  { id: 2, regNumber: "GJ01AB9987", name: "TRUCK-11", type: "Truck", maxCapacity: 5000, odometer: 182000, acquisitionCost: 2450000, status: "On Trip" },
  { id: 3, regNumber: "GJ01AB1120", name: "MINI-03", type: "Mini", maxCapacity: 1000, odometer: 66000, acquisitionCost: 410000, status: "In Shop" },
  { id: 4, regNumber: "GJ01AB0089", name: "VAN-09", type: "Van", maxCapacity: 750, odometer: 241900, acquisitionCost: 540000, status: "Retired" },
];

const emptyForm = { regNumber: "", name: "", type: "", maxCapacity: "", odometer: "", acquisitionCost: "", status: "Available" };

const columns = [
  { key: "regNumber", label: "Reg No." },
  { key: "name", label: "Name/Model" },
  { key: "type", label: "Type" },
  { key: "maxCapacity", label: "Capacity", render: (r) => `${r.maxCapacity} kg` },
  { key: "odometer", label: "Odometer", render: (r) => r.odometer.toLocaleString() },
  { key: "acquisitionCost", label: "Acq. Cost", render: (r) => `₹${r.acquisitionCost.toLocaleString()}` },
  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

const selectClass = "rounded-full border border-stone bg-white px-4 py-2 text-sm text-forest focus:border-sage focus:outline-none";

export default function Fleet() {
  const [vehicles, setVehicles] = useState(seed);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== "All" && v.type !== typeFilter) return false;
    if (statusFilter !== "All" && v.status !== statusFilter) return false;
    if (search && !v.regNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    setVehicles((prev) => [
      {
        id: Date.now(),
        ...form,
        regNumber: form.regNumber.toUpperCase(),
        maxCapacity: Number(form.maxCapacity),
        odometer: Number(form.odometer) || 0,
        acquisitionCost: Number(form.acquisitionCost) || 0,
      },
      ...prev,
    ]);
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-4xl font-semibold text-forest">Vehicle Registry</h2>
          <p className="mt-2 text-forest/60">Your master list of fleet vehicles.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} strokeWidth={2} /> Add Vehicle
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
          <option>All</option>
          <option>Van</option>
          <option>Truck</option>
          <option>Mini</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option>All</option>
          <option>Available</option>
          <option>On Trip</option>
          <option>In Shop</option>
          <option>Retired</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reg no..."
          className="min-w-[200px] flex-1 rounded-full border border-transparent bg-card px-4 py-2 text-sm text-forest placeholder:text-forest/40 focus:border-sage focus:outline-none"
        />
      </div>

      <Table columns={columns} data={filtered} empty="No vehicles found" />

      <p className="mt-4 text-xs text-terracotta">
        Rule: Registration number must be unique. Retired / In Shop vehicles are hidden from Trip Dispatcher.
      </p>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Vehicle">
        <form onSubmit={save} className="grid gap-4">
          <Input label="Registration Number" value={form.regNumber} onChange={update("regNumber")} placeholder="GJ01AB0000" required />
          <Input label="Name / Model" value={form.name} onChange={update("name")} placeholder="VAN-09" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Type" value={form.type} onChange={update("type")} placeholder="Van" required />
            <Input label="Max Capacity (kg)" type="number" value={form.maxCapacity} onChange={update("maxCapacity")} placeholder="500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Odometer" type="number" value={form.odometer} onChange={update("odometer")} placeholder="0" />
            <Input label="Acquisition Cost" type="number" value={form.acquisitionCost} onChange={update("acquisitionCost")} placeholder="0" />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
