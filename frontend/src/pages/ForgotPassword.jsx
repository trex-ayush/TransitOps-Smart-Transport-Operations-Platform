import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/users";
import Button from "../components/Button";
import Input from "../components/Input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-alabaster p-8">
      <form onSubmit={submit} noValidate className="w-full max-w-sm">
        <h1 className="font-serif text-3xl font-bold text-forest">
          Transit<span className="italic text-sage">Ops</span>
        </h1>
        <h2 className="mt-8 font-serif text-3xl font-semibold text-forest">Forgot password</h2>
        <p className="mb-6 mt-2 text-forest/60">Enter your email and we'll send you a reset link.</p>

        {message && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@transitops.in" />
        <Button type="submit" disabled={busy} className="mt-6 w-full">{busy ? "Sending..." : "Send Reset Link"}</Button>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-sage transition-colors hover:text-terracotta">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
