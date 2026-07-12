import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSetupStatus } from "../api/users";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSetupStatus()
      .then((d) => setSetupNeeded(d.setupNeeded))
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password || (setupNeeded && !name.trim())) {
      setError(setupNeeded ? "Name, email and password are required" : "Email and password are required");
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (setupNeeded) await register(name, email, password);
      else await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-alabaster lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-stone bg-white/60 p-12 lg:flex">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest">
            Transit<span className="italic text-sage">Ops</span>
          </h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-sage">Smart Transport Operations</p>
        </div>
        <div>
          <p className="mb-4 text-sm uppercase tracking-widest text-forest/50">One login, four roles</p>
          <ul className="space-y-2 text-forest/70">
            <li>Fleet Manager</li>
            <li>Dispatcher</li>
            <li>Safety Officer</li>
            <li>Financial Analyst</li>
          </ul>
        </div>
        <p className="text-xs uppercase tracking-widest text-forest/40">TransitOps © 2026</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} noValidate className="w-full max-w-sm">
          <h2 className="font-serif text-4xl font-semibold text-forest">
            {setupNeeded ? "Set up admin" : "Sign in"}
          </h2>
          <p className="mb-8 mt-2 text-forest/60">
            {setupNeeded
              ? "Create the first Fleet Manager account to get started."
              : "Enter your credentials to continue."}
          </p>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          <div className="grid gap-4">
            {setupNeeded && <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@transitops.in" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <Button type="submit" disabled={busy} className="mt-8 w-full">
            {busy ? "Please wait..." : setupNeeded ? "Create Admin Account" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
