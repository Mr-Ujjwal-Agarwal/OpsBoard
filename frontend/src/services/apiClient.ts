import axios from "axios";

/**
 * Base URL for the OpsBoard API.
 *
 * Resolved from VITE_API_BASE_URL at build time. Falls back to a relative
 * "/api" path so the same production build works whether the frontend is
 * served behind a reverse proxy that forwards /api to the backend, or
 * accessed directly in local development via docker compose.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? "An unexpected network error occurred.";
    return Promise.reject(new Error(message));
  }
);
