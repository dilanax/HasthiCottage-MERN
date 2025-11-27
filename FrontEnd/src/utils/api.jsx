// src/utils/api.js

// Prefer env for flexibility. In Vite, define VITE_API_BASE in .env (e.g., http://localhost:5000)
const BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5000";
const API = `${BASE}/api`;

/**
 * Read JWT (if you store it after login). Adjust as needed.
 */
const getToken = () => localStorage.getItem("token");
const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/**
 * Safer JSON helper: surface backend message when not ok.
 */
const json = async (res) => {
  if (!res.ok) {
    let msg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        msg = j.error || j.message || msg;
      } catch {
        if (text) msg = text;
      }
    } catch {}
    throw new Error(msg);
  }
  return res.json();
};

/**
 * Convert stored image path to full URL.
 */
export const imageURL = (imgPath) => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http")) return imgPath;
  
  // Convert Windows backslashes to forward slashes
  const normalizedPath = imgPath.replace(/\\/g, "/");
  
  // Ensure the path starts with uploads/ for proper static file serving
  const cleanPath = normalizedPath.replace(/^\/?/, "");
  if (!cleanPath.startsWith("uploads/")) {
    return `${BASE}/uploads/${cleanPath}`;
  }
  return `${BASE}/${cleanPath}`;
};

// -------------------- PACKAGES --------------------

/**
 * getPackages(query?, opts?) — both optional
 *   query: { page?, limit?, search? ... }
 *   opts:  { signal? }
 */
export const getPackages = async (query = {}, opts = {}) => {
  const qs = new URLSearchParams(query).toString();
  const url = `${API}/packages${qs ? `?${qs}` : ""}`;
  console.log("Fetching packages from:", url);
  console.log("Auth headers:", authHeaders());
  
  try {
    const response = await fetch(url, {
      signal: opts.signal,
      headers: {
        ...authHeaders(),
      },
    });
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    return json(response);
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const createPackage = async (formData, opts = {}) =>
  json(
    await fetch(`${API}/packages`, {
      method: "POST",
      body: formData, // let browser set multipart boundary
      signal: opts.signal,
      headers: {
        ...authHeaders(),
      },
    })
  );

export const updatePackage = async (id, formData, opts = {}) =>
  json(
    await fetch(`${API}/packages/${id}`, {
      method: "PUT",
      body: formData,
      signal: opts.signal,
      headers: {
        ...authHeaders(),
      },
    })
  );

export const deletePackage = async (id, opts = {}) =>
  json(
    await fetch(`${API}/packages/${id}`, {
      method: "DELETE",
      signal: opts.signal,
      headers: {
        ...authHeaders(),
      },
    })
  );

// -------------------- BOOKINGS / ANALYTICS --------------------

/**
 * getBookings({ from, to, page, limit, search }, opts?)
 * Dates: "YYYY-MM-DD"
 */
export const getBookings = async (q = {}, opts = {}) => {
  const qs = new URLSearchParams(q).toString();
  return json(
    await fetch(`${API}/bookings${qs ? `?${qs}` : ""}`, {
      signal: opts.signal,
      headers: {
        ...authHeaders(),
      },
    })
  );
};

/**
 * getAnalytics({ period, from, to }, opts?)
 * period: "monthly" | "weekly"
 */
export const getAnalytics = async (q = { period: "monthly" }, opts = {}) => {
  const qs = new URLSearchParams(q).toString();
  return json(
    await fetch(`${API}/bookings/analytics?${qs}`, {
      signal: opts.signal,
      headers: {
        ...authHeaders(),
      },
    })
  );
};

/**
 * downloadReport({ period, from, to })
 * Opens a generated PDF URL in a new tab.
 */
export const downloadReport = async (q = { period: "monthly" }) => {
  const qs = new URLSearchParams(q).toString();
  const data = await json(
    await fetch(`${API}/bookings/report?${qs}`, {
      headers: {
        ...authHeaders(),
      },
    })
  );
  if (data?.url) {
    window.open(data.url, "_blank");
  } else {
    throw new Error("Report URL not returned from server");
  }
};

