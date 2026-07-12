import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
          <p className="mt-2 text-sm uppercase tracking-widest text-sage">
            Smart Transport Operations
          </p>
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
        <form onSubmit={submit} className="w-full max-w-sm">
          <h2 className="font-serif text-4xl font-semibold text-forest">Sign in</h2>
          <p className="mb-8 mt-2 text-forest/60">Enter your credentials to continue.</p>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="raven@transitops.in" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <Button type="submit" disabled={busy} className="mt-8 w-full">
            {busy ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
