import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { getFuelLogs, createFuelLog, deleteFuelLog, getExpenses, createExpense, deleteExpense } from "../api/finance";
import { getMaintenance } from "../api/maintenance";
import { getVehicles } from "../api/vehicles";

const EXPENSE_TYPES = ["Toll", "Parking", "Permit", "Fine", "Other"];
const money = (n) => `₹${(n || 0).toLocaleString()}`;

export default function Expenses() {
  const [fuel, setFuel] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [openFuel, setOpenFuel] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicle: "", liters: "", cost: "", date: "" });
  const [expenseForm, setExpenseForm] = useState({ vehicle: "", type: "", amount: "", date: "" });
  const [error, setError] = useState("");

  const load = () => {
    getFuelLogs().then(setFuel).catch(() => {});
    getExpenses().then(setExpenses).catch(() => {});
    getMaintenance().then(setMaintenance).catch(() => {});
    getVehicles().then(setVehicles).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const vehicleOption = (v) => `${v.name} — ${v.regNumber}`;
  const findVehicle = (label) => vehicles.find((v) => vehicleOption(v) === label);

  const fuelTotal = fuel.reduce((s, f) => s + (f.cost || 0), 0);
  const maintTotal = maintenance.reduce((s, m) => s + (m.cost || 0), 0);
  const expenseTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const operationalCost = fuelTotal + maintTotal + expenseTotal;

  const saveFuel = async (e) => {
    e.preventDefault();
    setError("");
    if (!fuelForm.vehicle || !fuelForm.liters || !fuelForm.cost) return setError("Vehicle, litres and cost are required");
    try {
      await createFuelLog({ ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost) });
      setFuelForm({ vehicle: "", liters: "", cost: "", date: "" });
      setOpenFuel(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save fuel log");
    }
  };

  const saveExpense = async (e) => {
    e.preventDefault();
    setError("");
    if (!expenseForm.vehicle || !expenseForm.type || !expenseForm.amount) return setError("Vehicle, type and amount are required");
    try {
      await createExpense({ ...expenseForm, amount: Number(expenseForm.amount) });
      setExpenseForm({ vehicle: "", type: "", amount: "", date: "" });
      setOpenExpense(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save expense");
    }
  };

  const fuelColumns = [
    { key: "vehicle", label: "Vehicle", render: (r) => r.vehicle?.name || "—" },
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString("en-GB") },
    { key: "liters", label: "Litres", render: (r) => `${r.liters} L` },
    { key: "cost", label: "Fuel Cost", render: (r) => money(r.cost) },
    { key: "action", label: "", render: (r) => (
      <button onClick={() => deleteFuelLog(r._id).then(load)} className="text-forest/30 transition-colors hover:text-rose-500"><Trash2 size={16} strokeWidth={1.5} /></button>
    ) },
  ];

  const expenseColumns = [
    { key: "vehicle", label: "Vehicle", render: (r) => r.vehicle?.name || "—" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount", render: (r) => money(r.amount) },
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString("en-GB") },
    { key: "action", label: "", render: (r) => (
      <button onClick={() => deleteExpense(r._id).then(load)} className="text-forest/30 transition-colors hover:text-rose-500"><Trash2 size={16} strokeWidth={1.5} /></button>
    ) },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-4xl font-semibold text-forest">Fuel &amp; Expenses</h2>
          <p className="mt-2 text-forest/60">Track fuel logs and operational costs.</p>
        </div>
        <div className="rounded-3xl border border-stone bg-white px-6 py-4 text-right shadow-soft">
          <p className="text-[11px] uppercase tracking-widest text-forest/50">Total Operational Cost</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-forest">{money(operationalCost)}</p>
          <p className="mt-1 text-[11px] text-forest/40">Fuel {money(fuelTotal)} · Maint {money(maintTotal)} · Other {money(expenseTotal)}</p>
        </div>
      </div>

      {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-semibold text-forest">Fuel Logs</h3>
          <Button onClick={() => setOpenFuel(true)}><Plus size={16} strokeWidth={2} /> Log Fuel</Button>
        </div>
        <Table columns={fuelColumns} data={fuel} empty="No fuel logs yet" />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-semibold text-forest">Other Expenses</h3>
          <Button onClick={() => setOpenExpense(true)}><Plus size={16} strokeWidth={2} /> Add Expense</Button>
        </div>
        <Table columns={expenseColumns} data={expenses} empty="No expenses yet" />
      </div>

      <Modal open={openFuel} onClose={() => setOpenFuel(false)} title="Log Fuel">
        <form onSubmit={saveFuel} noValidate className="grid gap-4">
          <Select label="Vehicle" options={vehicles.map(vehicleOption)} placeholder="Select vehicle"
            value={vehicles.find((v) => v._id === fuelForm.vehicle) ? vehicleOption(vehicles.find((v) => v._id === fuelForm.vehicle)) : ""}
            onChange={(e) => setFuelForm((f) => ({ ...f, vehicle: findVehicle(e.target.value)?._id || "" }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Litres" type="number" value={fuelForm.liters} onChange={(e) => setFuelForm((f) => ({ ...f, liters: e.target.value }))} placeholder="42" />
            <Input label="Cost" type="number" value={fuelForm.cost} onChange={(e) => setFuelForm((f) => ({ ...f, cost: e.target.value }))} placeholder="3150" />
          </div>
          <Input label="Date" type="date" value={fuelForm.date} onChange={(e) => setFuelForm((f) => ({ ...f, date: e.target.value }))} />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpenFuel(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal open={openExpense} onClose={() => setOpenExpense(false)} title="Add Expense">
        <form onSubmit={saveExpense} noValidate className="grid gap-4">
          <Select label="Vehicle" options={vehicles.map(vehicleOption)} placeholder="Select vehicle"
            value={vehicles.find((v) => v._id === expenseForm.vehicle) ? vehicleOption(vehicles.find((v) => v._id === expenseForm.vehicle)) : ""}
            onChange={(e) => setExpenseForm((f) => ({ ...f, vehicle: findVehicle(e.target.value)?._id || "" }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" options={EXPENSE_TYPES} placeholder="Select type" value={expenseForm.type} onChange={(e) => setExpenseForm((f) => ({ ...f, type: e.target.value }))} />
            <Input label="Amount" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} placeholder="120" />
          </div>
          <Input label="Date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))} />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpenExpense(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
