// Automatically loads http://localhost:8000 in dev or Render URL in production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchFromBackend(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}