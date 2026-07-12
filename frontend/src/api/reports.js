import api from "./axios";

export const getReports = () => api.get("/reports").then((r) => r.data);
