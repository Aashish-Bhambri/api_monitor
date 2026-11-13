import axios from "axios";

const baseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api/' : '/api/');

export const api = axios.create({
  baseURL: baseUrl,
});
