import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/users";
import Button from "../components/Button";
import Input from "../components/Input";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setBusy(true);
    try {
      const res = await resetPassword(token, password);
      setMessage(res.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-alabaster p-8 text-center">
        <div>
          <p className="text-forest/60">This reset link is invalid.</p>
          <Link to="/forgot-password" className="text-sage transition-colors hover:text-terracotta">Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-alabaster p-8">
      <form onSubmit={submit} noValidate className="w-full max-w-sm">
        <h1 className="font-serif text-3xl font-bold text-forest">
          Transit<span className="italic text-sage">Ops</span>
        </h1>
        <h2 className="mt-8 font-serif text-3xl font-semibold text-forest">Reset password</h2>
        <p className="mb-6 mt-2 text-forest/60">Choose a new password for your account.</p>

        {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {message && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

        <div className="grid gap-4">
          <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" disabled={busy} className="mt-6 w-full">{busy ? "Resetting..." : "Reset Password"}</Button>
      </form>
    </div>
  );
}
