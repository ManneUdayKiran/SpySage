import axios from "axios";

const api = axios.create({
  baseURL: "https://spysage-backend.onrender.com",
});

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getCompetitors() {
  const res = await api.get("/api/competitors", {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function getChanges() {
  const res = await api.get("/api/changes", {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function createCompetitor(data) {
  const res = await api.post("/api/competitors", data, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function updateCompetitor(id, data) {
  const res = await api.put(`/api/competitors/${id}`, data, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function deleteCompetitor(id) {
  const res = await api.delete(`/api/competitors/${id}`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function loginUser(email, password) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
}

export async function signupUser(email, name, password) {
  const res = await api.post("/api/auth/signup", { email, name, password });
  return res.data;
}

export async function getProfile(token) {
  const res = await api.get("/api/user/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateProfile(token, data) {
  const res = await api.put("/api/user/me", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getTrendingCompetitors() {
  const res = await api.get("/api/competitors/trending", {
    headers: getAuthHeader(),
  });
  return res.data;
}
