import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { getUsers, createUser, deleteUser } from "../api/users";

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
const emptyForm = { name: "", email: "", role: "", password: "" };

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "Fleet Manager";

  const load = () => getUsers().then(setUsers).catch(() => {});

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (user && !isAdmin) {
    return (
      <div>
        <h2 className="mb-8 font-serif text-4xl font-semibold text-forest">Users</h2>
        <div className="rounded-3xl border border-stone bg-white p-12 text-center shadow-soft">
          <p className="text-sm uppercase tracking-widest text-forest/40">Only Fleet Managers can manage users</p>
        </div>
      </div>
    );
  }

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFormErrors((errs) => (errs[key] ? { ...errs, [key]: undefined } : errs));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.role) e.role = "Select a role";
    return e;
  };

  const save = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setFormErrors(errs);
    setError("");
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      const res = await createUser(payload);
      setForm(emptyForm);
      setOpen(false);
      setNotice(
        res.emailedPassword
          ? `User created — a temporary password was emailed to ${res.user.email}.`
          : `User created for ${res.user.email}.`
      );
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteUser(id);
      load();
    } catch {
      /* ignore */
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "active",
      label: "Status",
      render: (r) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${r.active ? "bg-emerald-100 text-emerald-800" : "bg-stone text-forest/60"}`}>
          {r.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "action",
      label: "",
      render: (r) =>
        r.id !== user.id ? (
          <button onClick={() => remove(r.id)} className="text-forest/30 transition-colors hover:text-rose-500" title="Delete">
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <span className="text-[11px] uppercase tracking-widest text-sage">You</span>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-4xl font-semibold text-forest">Users</h2>
          <p className="mt-2 text-forest/60">Create accounts and assign roles.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} strokeWidth={2} /> Add User
        </Button>
      </div>

      {notice && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <Table columns={columns} data={users} empty="No users yet" />

      <Modal open={open} onClose={() => { setOpen(false); setForm(emptyForm); setFormErrors({}); setError(""); }} title="Add User">
        <form onSubmit={save} noValidate className="grid gap-4">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <Input label="Name" value={form.name} onChange={update("name")} error={formErrors.name} placeholder="Alex Mathew" />
          <Input label="Email" type="email" value={form.email} onChange={update("email")} error={formErrors.email} placeholder="alex@transitops.in" />
          <Select label="Role" options={ROLES} placeholder="Select role" value={form.role} onChange={update("role")} error={formErrors.role} />
          <Input
            label="Password (optional)"
            hint="Leave blank to auto-generate and email a temporary password."
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="Auto-generated if blank"
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create User"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
