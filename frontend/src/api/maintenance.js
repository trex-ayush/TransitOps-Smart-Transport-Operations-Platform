import api from "./axios";

export const getMaintenance = () => api.get("/maintenance").then((r) => r.data);
export const createMaintenance = (data) => api.post("/maintenance", data).then((r) => r.data);
export const closeMaintenance = (id) => api.patch(`/maintenance/${id}/close`).then((r) => r.data);
