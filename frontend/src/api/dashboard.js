import api from "./axios";

export const getKpis = () => api.get("/dashboard/kpis").then((r) => r.data);
