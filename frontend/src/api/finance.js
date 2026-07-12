import api from "./axios";

export const getFuelLogs = () => api.get("/fuel").then((r) => r.data);
export const createFuelLog = (data) => api.post("/fuel", data).then((r) => r.data);
export const deleteFuelLog = (id) => api.delete(`/fuel/${id}`).then((r) => r.data);

export const getExpenses = () => api.get("/expenses").then((r) => r.data);
export const createExpense = (data) => api.post("/expenses", data).then((r) => r.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then((r) => r.data);
