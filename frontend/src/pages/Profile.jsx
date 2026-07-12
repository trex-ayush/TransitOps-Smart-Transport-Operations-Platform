import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

const initials = (name) =>
  name ? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() : "?";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    if (!name.trim()) return setProfileMsg("Name is required");
    setSavingProfile(true);
    try {
      await updateProfile(name);
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePwd = async (e) => {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");
    if (pwd.next.length < 6) return setPwdErr("New password must be at least 6 characters");
    if (pwd.next !== pwd.confirm) return setPwdErr("Passwords do not match");
    setSavingPwd(true);
    try {
      await changePassword(pwd.current, pwd.next);
      setPwdMsg("Password changed successfully.");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwdErr(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div>
      <h2 className="mb-2 font-serif text-4xl font-semibold text-forest">Profile</h2>
      <p className="mb-8 text-forest/60">Manage your account details.</p>

      <div className="mb-8 flex items-center gap-4 rounded-3xl border border-stone bg-white p-6 shadow-soft">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-forest text-xl font-medium text-white">
          {initials(user?.name)}
        </div>
        <div>
          <p className="font-serif text-2xl font-semibold text-forest">{user?.name}</p>
          <p className="text-sm text-forest/60">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full border border-sage px-3 py-0.5 text-[11px] uppercase tracking-widest text-sage">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone bg-white p-8 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Edit Profile</h3>
          <form onSubmit={saveProfile} noValidate className="grid gap-4">
            {profileMsg && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{profileMsg}</div>}
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <Input label="Email" value={user?.email || ""} disabled hint="Email cannot be changed." />
            <Button type="submit" disabled={savingProfile} className="mt-2">{savingProfile ? "Saving..." : "Save Profile"}</Button>
          </form>
        </div>

        <div className="rounded-3xl border border-stone bg-white p-8 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Change Password</h3>
          <form onSubmit={savePwd} noValidate className="grid gap-4">
            {pwdErr && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{pwdErr}</div>}
            {pwdMsg && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{pwdMsg}</div>}
            <Input label="Current Password" type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
            <Input label="New Password" type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
            <Button type="submit" disabled={savingPwd} className="mt-2">{savingPwd ? "Updating..." : "Change Password"}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
