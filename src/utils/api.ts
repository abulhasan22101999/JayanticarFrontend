// src/utils/api.ts

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  return res.json();
};