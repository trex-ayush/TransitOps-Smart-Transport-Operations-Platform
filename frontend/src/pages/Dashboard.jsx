import { useEffect, useState } from "react";
import { Truck, CircleCheck, Wrench, Navigation, Clock, Users, Gauge } from "lucide-react";
import KPICard from "../components/KPICard";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { getKpis } from "../api/dashboard";
import { getTrips } from "../api/trips";
import { getVehicles } from "../api/vehicles";

const statusBars = [
  { key: "Available", color: "bg-emerald-400" },
  { key: "On Trip", color: "bg-sky-400" },
  { key: "In Shop", color: "bg-amber-400" },
  { key: "Retired", color: "bg-rose-400" },
];

const tripColumns = [
  { key: "route", label: "Trip", render: (t) => `${t.source} → ${t.destination}` },
  { key: "vehicle", label: "Vehicle", render: (t) => t.vehicle?.name || "—" },
  { key: "driver", label: "Driver", render: (t) => t.driver?.name || "—" },
  { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} /> },
];

const selectClass = "rounded-full border border-stone bg-white px-4 py-2 text-sm text-forest focus:border-sage focus:outline-none";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  useEffect(() => {
    getKpis().then(setKpis).catch(() => {});
    getTrips().then((t) => setTrips(t.slice(0, 5))).catch(() => {});
    getVehicles().then(setVehicles).catch(() => {});
  }, []);

  const types = [...new Set(vehicles.map((v) => v.type))].filter(Boolean);
  const regions = [...new Set(vehicles.map((v) => v.region))].filter(Boolean);

  const filtering = typeFilter !== "All" || statusFilter !== "All" || regionFilter !== "All";
  const filteredVehicles = vehicles.filter((v) => {
    if (typeFilter !== "All" && v.type !== typeFilter) return false;
    if (statusFilter !== "All" && v.status !== statusFilter) return false;
    if (regionFilter !== "All" && v.region !== regionFilter) return false;
    return true;
  });

  const vStatus = { Available: 0, "On Trip": 0, "In Shop": 0, Retired: 0 };
  filteredVehicles.forEach((v) => {
    if (v.status in vStatus) vStatus[v.status]++;
  });
  const activeVehicles = filteredVehicles.length - vStatus.Retired;
  const fleetUtilization = activeVehicles ? Math.round((vStatus["On Trip"] / activeVehicles) * 100) : 0;

  const vehicleStatus = filtering ? vStatus : kpis?.vehicleStatus || vStatus;

  const cards = kpis
    ? [
        { label: "Active Vehicles", value: filtering ? activeVehicles : kpis.activeVehicles, icon: Truck },
        { label: "Available Vehicles", value: filtering ? vStatus.Available : kpis.availableVehicles, icon: CircleCheck },
        { label: "In Maintenance", value: filtering ? vStatus["In Shop"] : kpis.inMaintenance, icon: Wrench },
        { label: "Active Trips", value: kpis.activeTrips, icon: Navigation },
        { label: "Pending Trips", value: kpis.pendingTrips, icon: Clock },
        { label: "Drivers On Duty", value: kpis.driversOnDuty, icon: Users },
        { label: "Fleet Utilization", value: `${filtering ? fleetUtilization : kpis.fleetUtilization}%`, icon: Gauge },
      ]
    : [];

  const totalVehicles = Object.values(vehicleStatus).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h2 className="mb-2 font-serif text-4xl font-semibold text-forest">Dashboard</h2>
      <p className="mb-6 text-forest/60">Your fleet operations at a glance.</p>

      <div className="mb-8 flex flex-wrap gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
          <option>All</option>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option>All</option>
          <option>Available</option>
          <option>On Trip</option>
          <option>In Shop</option>
          <option>Retired</option>
        </select>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className={selectClass}>
          <option>All</option>
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => (
          <KPICard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h3 className="mb-4 font-serif text-2xl font-semibold text-forest">Recent Trips</h3>
          <Table columns={tripColumns} data={trips} empty="No trips yet" />
        </div>

        <div>
          <h3 className="mb-4 font-serif text-2xl font-semibold text-forest">Vehicle Status</h3>
          <div className="space-y-4 rounded-3xl border border-stone bg-white p-6 shadow-soft">
            {statusBars.map(({ key, color }) => {
              const count = vehicleStatus[key] || 0;
              const pct = totalVehicles ? (count / totalVehicles) * 100 : 0;
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs text-forest/60">
                    <span>{key}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
