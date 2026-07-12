import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Table from "../components/Table";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Select from "../components/Select";
import { getVehicles, createVehicle, deleteVehicle } from "../api/vehicles";

const VEHICLE_TYPES = ["Van", "Truck", "Mini", "Bus", "Car"];

const emptyForm = { regNumber: "", name: "", type: "", maxCapacity: "", odometer: "", acquisitionCost: "" };

const selectClass = "rounded-full border border-stone bg-white px-4 py-2 text-sm text-forest focus:border-sage focus:outline-none";

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getVehicles()
      .then(setVehicles)
      .catch(() => setError("Failed to load vehicles"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key) => (e) => {
    const value = key === "regNumber" ? e.target.value.toUpperCase() : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((errs) => (errs[key] ? { ...errs, [key]: undefined } : errs));
  };

  const validate = () => {
    const e = {};
    if (!form.regNumber.trim()) e.regNumber = "Registration number is required";
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.type.trim()) e.type = "Type is required";
    if (!form.maxCapacity || Number(form.maxCapacity) <= 0) e.maxCapacity = "Enter a valid capacity";
    return e;
  };

  const closeModal = () => {
    setOpen(false);
    setForm(emptyForm);
    setFormErrors({});
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setFormErrors(errs);
    setError("");
    setSaving(true);
    try {
      await createVehicle({
        ...form,
        maxCapacity: Number(form.maxCapacity),
        odometer: Number(form.odometer) || 0,
        acquisitionCost: Number(form.acquisitionCost) || 0,
      });
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await deleteVehicle(id);
    load();
  };

  const columns = [
    { key: "regNumber", label: "Reg No." },
    { key: "name", label: "Name/Model" },
    { key: "type", label: "Type" },
    { key: "maxCapacity", label: "Capacity", render: (r) => `${r.maxCapacity} kg` },
    { key: "odometer", label: "Odometer", render: (r) => r.odometer.toLocaleString() },
    { key: "acquisitionCost", label: "Acq. Cost", render: (r) => `₹${r.acquisitionCost.toLocaleString()}` },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <button onClick={() => remove(r._id)} className="text-forest/30 transition-colors hover:text-rose-500" title="Delete">
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      ),
    },
  ];

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== "All" && v.type !== typeFilter) return false;
    if (statusFilter !== "All" && v.status !== statusFilter) return false;
    if (search && !v.regNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          {VEHICLE_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
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

      {loading ? (
        <p className="text-sm text-forest/50">Loading vehicles...</p>
      ) : (
        <Table columns={columns} data={filtered} empty="No vehicles found" />
      )}

      <p className="mt-4 text-xs text-terracotta">
        Rule: Registration number must be unique. Retired / In Shop vehicles are hidden from Trip Dispatcher.
      </p>

      <Modal open={open} onClose={closeModal} title="Add Vehicle">
        <form onSubmit={save} noValidate className="grid gap-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}
          <Input
            label="Registration Number"
            hint="Unique number plate for the vehicle. Automatically capitalised."
            value={form.regNumber}
            onChange={update("regNumber")}
            error={formErrors.regNumber}
            placeholder="GJ01AB0000"
          />
          <Input
            label="Name / Model"
            hint="A friendly display name, e.g. VAN-05."
            value={form.name}
            onChange={update("name")}
            error={formErrors.name}
            placeholder="VAN-09"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              hint="Vehicle category. Choose from the list."
              options={VEHICLE_TYPES}
              placeholder="Select type"
              value={form.type}
              onChange={update("type")}
              error={formErrors.type}
            />
            <Input
              label="Max Capacity (kg)"
              hint="Maximum load the vehicle can carry, in kilograms."
              type="number"
              value={form.maxCapacity}
              onChange={update("maxCapacity")}
              error={formErrors.maxCapacity}
              placeholder="500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Odometer"
              hint="Current distance reading, in kilometres."
              type="number"
              value={form.odometer}
              onChange={update("odometer")}
              placeholder="0"
            />
            <Input
              label="Acquisition Cost"
              hint="Purchase price. Used for ROI reports."
              type="number"
              value={form.acquisitionCost}
              onChange={update("acquisitionCost")}
              placeholder="0"
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
