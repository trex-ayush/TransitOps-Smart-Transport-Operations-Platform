import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PaperGrain from "./PaperGrain";

export default function Layout() {
  return (
    <div className="min-h-screen bg-alabaster text-forest">
      <PaperGrain />
      <Sidebar />
      <div className="pl-64">
        <Topbar />
        <main className="px-8 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
