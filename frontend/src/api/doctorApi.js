import axios from "axios";

const API_BASE = "http://localhost:8080/api/doctors";

export const getDoctors = () => axios.get(API_BASE);

export const createDoctor = (doctor) => axios.post(API_BASE, doctor);

export const updateDoctor = (id, doctor) => axios.put(`${API_BASE}/${id}`, doctor);

export const deleteDoctor = (id) => axios.delete(`${API_BASE}/${id}`);
