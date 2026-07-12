const tones = {
  green: "bg-emerald-100 text-emerald-800",
  blue: "bg-sky-100 text-sky-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-800",
  gray: "bg-stone text-forest/60",
};

const statusTone = {
  Available: "green",
  Completed: "green",
  "On Trip": "blue",
  Dispatched: "blue",
  "In Shop": "amber",
  Maintenance: "amber",
  Pending: "amber",
  Retired: "red",
  Suspended: "red",
  Cancelled: "red",
  "Off Duty": "gray",
  Draft: "gray",
};

export default function StatusBadge({ status }) {
  const tone = tones[statusTone[status]] || tones.gray;
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}
