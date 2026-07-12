import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { getDrivers, createDriver, updateDriver, deleteDriver } from "../api/drivers";

const LICENSE_CATEGORIES = ["LMV", "HMV", "MCWG", "Trailer"];
const STATUSES = ["Available", "On Trip", "Off Duty", "Suspended"];

const emptyForm = { name: "", licenseNumber: "", licenseCategory: "", licenseExpiry: "", contact: "", safetyScore: "100" };

const selectClass = "rounded-full border border-stone bg-white px-4 py-2 text-sm text-forest focus:border-sage focus:outline-none";

const formatExpiry = (value) => {
  const date = new Date(value);
  const expired = date < new Date();
  return (
    <span className={expired ? "font-medium text-rose-600" : "text-forest/80"}>
      {date.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
      {expired && <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide">Expired</span>}
    </span>
  );
};

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getDrivers()
      .then(setDrivers)
      .catch(() => setError("Failed to load drivers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key) => (e) => {
    let value = e.target.value;
    if (key === "licenseNumber" || key === "name") value = value.toUpperCase();
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((errs) => (errs[key] ? { ...errs, [key]: undefined } : errs));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.licenseNumber.trim()) e.licenseNumber = "License number is required";
    if (!form.licenseCategory) e.licenseCategory = "Select a category";
    if (!form.licenseExpiry) e.licenseExpiry = "Expiry date is required";
    return e;
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormErrors({});
    setError("");
    setOpen(true);
  };

  const openEdit = (d) => {
    setForm({
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiry: d.licenseExpiry ? d.licenseExpiry.slice(0, 10) : "",
      contact: d.contact || "",
      safetyScore: String(d.safetyScore ?? ""),
    });
    setEditingId(d._id);
    setFormErrors({});
    setError("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
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
      const payload = { ...form, safetyScore: Number(form.safetyScore) || 0 };
      if (editingId) await updateDriver(editingId, payload);
      else await createDriver(payload);
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await deleteDriver(id);
    load();
  };

  const columns = [
    { key: "name", label: "Driver" },
    { key: "licenseNumber", label: "License No" },
    { key: "licenseCategory", label: "Category" },
    { key: "licenseExpiry", label: "Expiry", render: (r) => formatExpiry(r.licenseExpiry) },
    { key: "contact", label: "Contact" },
    { key: "safetyScore", label: "Safety", render: (r) => `${r.safetyScore}%` },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-forest/30 transition-colors hover:text-sage" title="Edit">
            <Pencil size={16} strokeWidth={1.5} />
          </button>
          <button onClick={() => remove(r._id)} className="text-forest/30 transition-colors hover:text-rose-500" title="Delete">
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      ),
    },
  ];

  const filtered = drivers.filter((d) => {
    if (statusFilter !== "All" && d.status !== statusFilter) return false;
    if (search && !`${d.name} ${d.licenseNumber}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-4xl font-semibold text-forest">Drivers</h2>
          <p className="mt-2 text-forest/60">Driver profiles and licence compliance.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} strokeWidth={2} /> Add Driver
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or licence..."
          className="min-w-[200px] flex-1 rounded-full border border-transparent bg-card px-4 py-2 text-sm text-forest placeholder:text-forest/40 focus:border-sage focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-sm text-forest/50">Loading drivers...</p>
      ) : (
        <Table columns={columns} data={filtered} empty="No drivers found" />
      )}

      <p className="mt-4 text-xs text-terracotta">
        Rule: Drivers with an expired licence or Suspended status cannot be assigned to trips.
      </p>

      <Modal open={open} onClose={closeModal} title={editingId ? "Edit Driver" : "Add Driver"}>
        <form onSubmit={save} noValidate className="grid gap-4">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <Input
            label="Name"
            hint="Full name of the driver. Automatically capitalised."
            value={form.name}
            onChange={update("name")}
            error={formErrors.name}
            placeholder="Alex Mathew"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Number"
              hint="Driving licence number. Automatically capitalised."
              value={form.licenseNumber}
              onChange={update("licenseNumber")}
              error={formErrors.licenseNumber}
              placeholder="DL-88213"
            />
            <Select
              label="Category"
              hint="Licence class the driver holds."
              options={LICENSE_CATEGORIES}
              placeholder="Select category"
              value={form.licenseCategory}
              onChange={update("licenseCategory")}
              error={formErrors.licenseCategory}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="License Expiry"
              hint="Licence validity end date. Expired drivers can't be dispatched."
              type="date"
              value={form.licenseExpiry}
              onChange={update("licenseExpiry")}
              error={formErrors.licenseExpiry}
            />
            <Input
              label="Safety Score"
              hint="Driver safety rating, 0 to 100."
              type="number"
              value={form.safetyScore}
              onChange={update("safetyScore")}
              placeholder="100"
            />
          </div>
          <Input label="Contact" hint="Phone number for the driver." value={form.contact} onChange={update("contact")} placeholder="98765xxxxx" />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
