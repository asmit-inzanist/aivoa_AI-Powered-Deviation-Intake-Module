const BASE = "http://127.0.0.1:8000";

async function handle(res) {
  if (!res.ok) {
    let msg = "Something went wrong";
    try {
      const j = await res.json();
      msg = typeof j.detail === "string" ? j.detail : "Please check the form values";
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const extractFromFile = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return fetch(`${BASE}/api/ai/extract`, { method: "POST", body: fd }).then(handle);
};

export const extractFromText = (text) => {
  const fd = new FormData();
  fd.append("text", text);
  return fetch(`${BASE}/api/ai/extract`, { method: "POST", body: fd }).then(handle);
};

export const chatWithAI = (message, form) =>
  fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, form }),
  }).then(handle);

export const saveDeviation = (payload) =>
  fetch(`${BASE}/api/deviations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handle);
