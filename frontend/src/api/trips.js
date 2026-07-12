import api from "./axios";

export const getTrips = () => api.get("/trips").then((r) => r.data);
export const createTrip = (data) => api.post("/trips", data).then((r) => r.data);
export const dispatchTrip = (id) => api.patch(`/trips/${id}/dispatch`).then((r) => r.data);
export const completeTrip = (id, data) => api.patch(`/trips/${id}/complete`, data).then((r) => r.data);
export const cancelTrip = (id) => api.patch(`/trips/${id}/cancel`).then((r) => r.data);
