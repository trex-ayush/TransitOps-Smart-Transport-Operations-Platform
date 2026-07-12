import { useEffect, useState } from "react";
import { Check, Eye, Minus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import { getSettings, updateSettings } from "../api/settings";

const modules = ["Fleet", "Drivers", "Trips", "Fuel/Exp", "Analytics"];
const rbac = [
  { role: "Fleet Manager", access: ["full", "full", "none", "none", "full"] },
  { role: "Dispatcher", access: ["view", "none", "full", "none", "none"] },
  { role: "Safety Officer", access: ["none", "full", "view", "none", "none"] },
  { role: "Financial Analyst", access: ["view", "none", "none", "full", "full"] },
];

const AccessCell = ({ level }) => {
  if (level === "full") return <Check size={16} strokeWidth={2} className="mx-auto text-emerald-600" />;
  if (level === "view") return <Eye size={15} strokeWidth={1.5} className="mx-auto text-sky-500" />;
  return <Minus size={15} strokeWidth={1.5} className="mx-auto text-forest/30" />;
};

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Fleet Manager";
  const [form, setForm] = useState({ depotName: "", currency: "INR", distanceUnit: "Kilometers" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getSettings()
      .then((s) => setForm({ depotName: s.depotName, currency: s.currency, distanceUnit: s.distanceUnit }))
      .catch(() => {});
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await updateSettings(form);
      setNotice("Settings saved.");
    } catch {
      setNotice("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="mb-2 font-serif text-4xl font-semibold text-forest">Settings</h2>
      <p className="mb-8 text-forest/60">Depot configuration and access control.</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone bg-white p-8 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">General</h3>
          <form onSubmit={save} className="grid gap-4">
            {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
            <Input label="Depot Name" value={form.depotName} onChange={update("depotName")} disabled={!isAdmin} placeholder="Gandhinagar Depot" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Currency" options={["INR", "USD", "EUR"]} value={form.currency} onChange={update("currency")} disabled={!isAdmin} />
              <Select label="Distance Unit" options={["Kilometers", "Miles"]} value={form.distanceUnit} onChange={update("distanceUnit")} disabled={!isAdmin} />
            </div>
            {isAdmin ? (
              <Button type="submit" disabled={saving} className="mt-2">{saving ? "Saving..." : "Save Changes"}</Button>
            ) : (
              <p className="mt-2 text-xs text-forest/40">Only Fleet Managers can change these settings.</p>
            )}
          </form>
        </div>

        <div className="rounded-3xl border border-stone bg-white p-8 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Role-Based Access</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone">
                  <th className="py-3 pr-4 text-[11px] font-medium uppercase tracking-widest text-forest/50">Role</th>
                  {modules.map((m) => (
                    <th key={m} className="px-2 py-3 text-center text-[11px] font-medium uppercase tracking-widest text-forest/50">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rbac.map((row) => (
                  <tr key={row.role} className="border-b border-stone/60 last:border-0">
                    <td className="py-3 pr-4 text-forest/80">{row.role}</td>
                    {row.access.map((level, i) => (
                      <td key={i} className="px-2 py-3 text-center">
                        <AccessCell level={level} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-forest/40">
            <Check size={12} className="inline text-emerald-600" /> Full ·{" "}
            <Eye size={12} className="inline text-sky-500" /> View only ·{" "}
            <Minus size={12} className="inline text-forest/30" /> No access
          </p>
        </div>
      </div>
    </div>
  );
}
