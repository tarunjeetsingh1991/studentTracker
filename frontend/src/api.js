const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api";

export async function api(path, options = {}) {

  const res = await fetch(BASE + path, {
    ...options,

    // Send the session cookie with every request
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw Error(
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`
    );
  }

  return data;
}

export const params = (from, to) =>
  new URLSearchParams({ from, to }).toString();



export async function downloadPdf(path, filename) {
  const BASE =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/api";

  const response = await fetch(BASE + path, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/pdf"
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.message ||
      data?.error ||
      `PDF download failed (${response.status})`
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
