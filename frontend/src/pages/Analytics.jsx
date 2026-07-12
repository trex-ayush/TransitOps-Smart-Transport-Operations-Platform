import { useEffect, useState } from "react";
import { Fuel, Gauge, Wallet, TrendingUp, Download } from "lucide-react";
import KPICard from "../components/KPICard";
import Table from "../components/Table";
import Button from "../components/Button";
import { getReports } from "../api/reports";

const money = (n) => `₹${(n || 0).toLocaleString()}`;

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getReports().then(setData).catch(() => {});
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const headers = ["Vehicle", "Reg No", "Revenue", "Fuel Cost", "Maintenance", "Other", "Operational Cost", "Fuel Efficiency (km/L)", "ROI %"];
    const rows = data.vehicleReports.map((r) => [r.name, r.regNumber, r.revenue, r.fuelCost, r.maintenanceCost, r.expenseCost, r.operationalCost, r.fuelEfficiency, r.roi]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transitops-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = data
    ? [
        { label: "Fuel Efficiency", value: `${data.fuelEfficiency} km/L`, icon: Fuel },
        { label: "Fleet Utilization", value: `${data.fleetUtilization}%`, icon: Gauge },
        { label: "Operational Cost", value: money(data.operationalCost), icon: Wallet },
        { label: "Vehicle ROI", value: `${data.avgRoi}%`, icon: TrendingUp },
      ]
    : [];

  const maxRevenue = data ? Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1) : 1;
  const maxCost = data ? Math.max(...data.topCostliestVehicles.map((v) => v.cost), 1) : 1;

  const columns = [
    { key: "name", label: "Vehicle" },
    { key: "revenue", label: "Revenue", render: (r) => money(r.revenue) },
    { key: "operationalCost", label: "Op. Cost", render: (r) => money(r.operationalCost) },
    { key: "fuelEfficiency", label: "Efficiency", render: (r) => `${r.fuelEfficiency} km/L` },
    { key: "roi", label: "ROI", render: (r) => `${r.roi}%` },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-4xl font-semibold text-forest">Analytics</h2>
          <p className="mt-2 text-forest/60">Efficiency, cost and ROI insights.</p>
        </div>
        <Button variant="secondary" onClick={exportCsv}>
          <Download size={16} strokeWidth={1.5} /> Export CSV
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <KPICard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>
      <p className="mb-10 text-xs text-forest/40">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost</p>

      <div className="mb-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone bg-white p-6 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Monthly Revenue</h3>
          {data && data.monthlyRevenue.length ? (
            <div className="flex h-48 items-end gap-3">
              {data.monthlyRevenue.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-sky-400/80" style={{ height: `${(m.revenue / maxRevenue) * 100}%` }} title={money(m.revenue)} />
                  <span className="text-xs text-forest/50">{m.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-forest/40">No completed trips yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-stone bg-white p-6 shadow-soft">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-forest">Top Costliest Vehicles</h3>
          {data && data.topCostliestVehicles.length ? (
            <div className="space-y-4">
              {data.topCostliestVehicles.map((v) => (
                <div key={v.name}>
                  <div className="mb-1 flex justify-between text-xs text-forest/60">
                    <span>{v.name}</span>
                    <span>{money(v.cost)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone">
                    <div className="h-full rounded-full bg-terracotta" style={{ width: `${(v.cost / maxCost) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-forest/40">No cost data yet.</p>
          )}
        </div>
      </div>

      <h3 className="mb-4 font-serif text-2xl font-semibold text-forest">Per-Vehicle Report</h3>
      <Table columns={columns} data={data?.vehicleReports || []} empty="No data yet" />
    </div>
  );
}
