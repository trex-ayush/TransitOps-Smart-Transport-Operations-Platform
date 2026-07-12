import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from "../api/trips";
import { getVehicles } from "../api/vehicles";
import { getDrivers } from "../api/drivers";

const emptyForm = { source: "", destination: "", vehicle: "", driver: "", cargoWeight: "", plannedDistance: "", revenue: "" };
const steps = ["Draft", "Dispatched", "Completed"];

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [boardError, setBoardError] = useState("");
  const [saving, setSaving] = useState(false);
  const [completeFor, setCompleteFor] = useState(null);
  const [completeData, setCompleteData] = useState({ finalOdometer: "", fuelConsumed: "" });

  const load = () => {
    getTrips().then(setTrips).catch(() => setBoardError("Failed to load trips"));
    getVehicles().then(setVehicles).catch(() => {});
    getDrivers().then(setDrivers).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const availableDrivers = drivers.filter((d) => d.status === "Available" && new Date(d.licenseExpiry) > new Date());
  const selectedVehicle = vehicles.find((v) => v._id === form.vehicle);
  const overCapacity = selectedVehicle && form.cargoWeight && Number(form.cargoWeight) > selectedVehicle.maxCapacity;

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFormErrors((errs) => (errs[key] ? { ...errs, [key]: undefined } : errs));
  };

  const validate = () => {
    const e = {};
    if (!form.source.trim()) e.source = "Source is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    if (!form.vehicle) e.vehicle = "Select a vehicle";
    if (!form.driver) e.driver = "Select a driver";
    if (!form.cargoWeight || Number(form.cargoWeight) <= 0) e.cargoWeight = "Enter cargo weight";
    if (!form.plannedDistance || Number(form.plannedDistance) <= 0) e.plannedDistance = "Enter planned distance";
    return e;
  };

  const create = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setFormErrors(errs);
    if (overCapacity) return;
    setError("");
    setSaving(true);
    try {
      await createTrip({
        ...form,
        cargoWeight: Number(form.cargoWeight),
        plannedDistance: Number(form.plannedDistance),
        revenue: Number(form.revenue) || 0,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to create trip");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (fn) => {
    setBoardError("");
    try {
      await fn();
      load();
    } catch (err) {
      setBoardError(err.response?.data?.message || "Action failed");
    }
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    await runAction(() =>
      completeTrip(completeFor._id, {
        finalOdometer: Number(completeData.finalOdometer),
        fuelConsumed: Number(completeData.fuelConsumed),
      })
    );
    setCompleteFor(null);
    setCompleteData({ finalOdometer: "", fuelConsumed: "" });
  };

  return (
    <div>
      <h2 className="mb-2 font-serif text-4xl font-semibold text-forest">Trip Dispatcher</h2>
      <p className="mb-8 text-forest/60">Create trips, validate capacity and manage the lifecycle.</p>

      <div className="mb-8 flex items-center gap-3 text-sm">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span className="rounded-full bg-clay/50 px-3 py-1 text-xs uppercase tracking-widest text-forest/70">{s}</span>
            {i < steps.length - 1 && <ArrowRight size={14} strokeWidth={1.5} className="text-sage" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone bg-white p-8 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Create Trip</h3>
          <form onSubmit={create} noValidate className="grid gap-4">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Source" value={form.source} onChange={update("source")} error={formErrors.source} placeholder="Gandhinagar Depot" />
              <Input label="Destination" value={form.destination} onChange={update("destination")} error={formErrors.destination} placeholder="Ahmedabad Hub" />
            </div>
            <Select
              label="Vehicle (available only)"
              hint="Only vehicles that are currently Available appear here."
              options={availableVehicles.map((v) => `${v.name} — ${v.maxCapacity} kg`)}
              placeholder={availableVehicles.length ? "Select vehicle" : "No available vehicles"}
              value={selectedVehicle ? `${selectedVehicle.name} — ${selectedVehicle.maxCapacity} kg` : ""}
              onChange={(e) => {
                const v = availableVehicles.find((x) => `${x.name} — ${x.maxCapacity} kg` === e.target.value);
                setForm((f) => ({ ...f, vehicle: v?._id || "" }));
                setFormErrors((errs) => ({ ...errs, vehicle: undefined }));
              }}
              error={formErrors.vehicle}
            />
            <Select
              label="Driver (available only)"
              hint="Only Available drivers with a valid licence appear here."
              options={availableDrivers.map((d) => `${d.name} — ${d.licenseNumber}`)}
              placeholder={availableDrivers.length ? "Select driver" : "No available drivers"}
              value={(() => {
                const d = drivers.find((x) => x._id === form.driver);
                return d ? `${d.name} — ${d.licenseNumber}` : "";
              })()}
              onChange={(e) => {
                const d = availableDrivers.find((x) => `${x.name} — ${x.licenseNumber}` === e.target.value);
                setForm((f) => ({ ...f, driver: d?._id || "" }));
                setFormErrors((errs) => ({ ...errs, driver: undefined }));
              }}
              error={formErrors.driver}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cargo Weight (kg)" type="number" value={form.cargoWeight} onChange={update("cargoWeight")} error={formErrors.cargoWeight} placeholder="450" />
              <Input label="Planned Distance (km)" type="number" value={form.plannedDistance} onChange={update("plannedDistance")} error={formErrors.plannedDistance} placeholder="38" />
            </div>
            <Input label="Revenue" hint="Expected revenue from the trip, for ROI reports." type="number" value={form.revenue} onChange={update("revenue")} placeholder="0" />

            {overCapacity && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Vehicle capacity: {selectedVehicle.maxCapacity} kg · Cargo: {form.cargoWeight} kg — capacity exceeded, cannot create.
              </div>
            )}

            <Button type="submit" disabled={saving || overCapacity} className="mt-2">
              {saving ? "Creating..." : "Create Trip"}
            </Button>
          </form>
        </div>

        <div>
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Live Board</h3>
          {boardError && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{boardError}</div>}
          <div className="space-y-4">
            {trips.length === 0 && <p className="text-sm text-forest/40">No trips yet.</p>}
            {trips.map((t) => (
              <div key={t._id} className="rounded-3xl border border-stone bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-forest">
                      {t.source} <span className="text-sage">→</span> {t.destination}
                    </p>
                    <p className="mt-1 text-xs text-forest/50">
                      {t.vehicle?.name || "—"} · {t.driver?.name || "—"} · {t.cargoWeight} kg
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                {(t.status === "Draft" || t.status === "Dispatched") && (
                  <div className="mt-4 flex gap-2">
                    {t.status === "Draft" && (
                      <Button className="px-4 py-1.5 text-xs" onClick={() => runAction(() => dispatchTrip(t._id))}>Dispatch</Button>
                    )}
                    {t.status === "Dispatched" && (
                      <Button className="px-4 py-1.5 text-xs" onClick={() => setCompleteFor(t)}>Complete</Button>
                    )}
                    <Button variant="secondary" className="px-4 py-1.5 text-xs" onClick={() => runAction(() => cancelTrip(t._id))}>Cancel</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!completeFor} onClose={() => setCompleteFor(null)} title="Complete Trip">
        <form onSubmit={submitComplete} noValidate className="grid gap-4">
          <Input
            label="Final Odometer"
            hint="Odometer reading at trip end. Updates the vehicle."
            type="number"
            value={completeData.finalOdometer}
            onChange={(e) => setCompleteData((d) => ({ ...d, finalOdometer: e.target.value }))}
            required
          />
          <Input
            label="Fuel Consumed (litres)"
            hint="Total fuel used, for efficiency reports."
            type="number"
            value={completeData.fuelConsumed}
            onChange={(e) => setCompleteData((d) => ({ ...d, fuelConsumed: e.target.value }))}
            required
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setCompleteFor(null)}>Cancel</Button>
            <Button type="submit">Complete</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
