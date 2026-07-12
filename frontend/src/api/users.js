import api from "./axios";

export const getSetupStatus = () => api.get("/auth/status").then((r) => r.data);
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (token, password) => api.post("/auth/reset-password", { token, password }).then((r) => r.data);
export const getUsers = () => api.get("/users").then((r) => r.data);
export const createUser = (data) => api.post("/users", data).then((r) => r.data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data);
