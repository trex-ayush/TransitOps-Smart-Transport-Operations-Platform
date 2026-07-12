import { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";
import { getMaintenance, createMaintenance, closeMaintenance } from "../api/maintenance";
import { getVehicles } from "../api/vehicles";

const emptyForm = { vehicle: "", serviceType: "", cost: "", date: "" };

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    getMaintenance().then(setRecords).catch(() => setError("Failed to load records"));
    getVehicles().then(setVehicles).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const eligible = vehicles.filter((v) => v.status !== "Retired" && v.status !== "On Trip");
  const selected = vehicles.find((v) => v._id === form.vehicle);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFormErrors((errs) => (errs[key] ? { ...errs, [key]: undefined } : errs));
  };

  const validate = () => {
    const e = {};
    if (!form.vehicle) e.vehicle = "Select a vehicle";
    if (!form.serviceType.trim()) e.serviceType = "Service type is required";
    return e;
  };

  const save = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setFormErrors(errs);
    setError("");
    setSaving(true);
    try {
      await createMaintenance({ ...form, cost: Number(form.cost) || 0 });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const close = async (id) => {
    setError("");
    try {
      await closeMaintenance(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to close");
    }
  };

  const columns = [
    { key: "vehicle", label: "Vehicle", render: (r) => r.vehicle?.name || "—" },
    { key: "serviceType", label: "Service" },
    { key: "cost", label: "Cost", render: (r) => `₹${r.cost.toLocaleString()}` },
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString("en-GB") },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      label: "",
      render: (r) =>
        r.status === "Active" ? (
          <button onClick={() => close(r._id)} className="text-xs uppercase tracking-widest text-sage transition-colors hover:text-terracotta">
            Close
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <h2 className="mb-2 font-serif text-4xl font-semibold text-forest">Maintenance</h2>
      <p className="mb-8 text-forest/60">Log service records and manage vehicle upkeep.</p>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="rounded-3xl border border-stone bg-white p-8 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Log Service Record</h3>
          <form onSubmit={save} noValidate className="grid gap-4">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            <Select
              label="Vehicle"
              hint="Retired and on-trip vehicles cannot be serviced."
              options={eligible.map((v) => `${v.name} — ${v.regNumber}`)}
              placeholder={eligible.length ? "Select vehicle" : "No eligible vehicles"}
              value={selected ? `${selected.name} — ${selected.regNumber}` : ""}
              onChange={(e) => {
                const v = eligible.find((x) => `${x.name} — ${x.regNumber}` === e.target.value);
                setForm((f) => ({ ...f, vehicle: v?._id || "" }));
                setFormErrors((errs) => ({ ...errs, vehicle: undefined }));
              }}
              error={formErrors.vehicle}
            />
            <Input label="Service Type" hint="e.g. Oil Change, Tyre Replace." value={form.serviceType} onChange={update("serviceType")} error={formErrors.serviceType} placeholder="Oil Change" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cost" hint="Service cost." type="number" value={form.cost} onChange={update("cost")} placeholder="2500" />
              <Input label="Date" type="date" value={form.date} onChange={update("date")} />
            </div>
            <Button type="submit" disabled={saving} className="mt-2">
              {saving ? "Saving..." : "Save Record"}
            </Button>
          </form>
          <p className="mt-6 text-xs text-terracotta">
            Creating a record moves the vehicle to In Shop. Closing it restores the vehicle to Available.
          </p>
        </div>

        <div>
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Service Log</h3>
          <Table columns={columns} data={records} empty="No service records yet" />
        </div>
      </div>
    </div>
  );
}
