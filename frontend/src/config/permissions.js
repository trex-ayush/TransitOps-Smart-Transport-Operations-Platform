export const PERMISSIONS = {
  "Fleet Manager": ["dashboard", "fleet", "drivers", "trips", "maintenance", "expenses", "analytics", "users", "settings"],
  Dispatcher: ["dashboard", "fleet", "trips", "maintenance", "settings"],
  "Safety Officer": ["dashboard", "drivers", "trips", "settings"],
  "Financial Analyst": ["dashboard", "expenses", "analytics", "settings"],
};

export const can = (role, module) => !!PERMISSIONS[role]?.includes(module);
