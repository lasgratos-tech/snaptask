import fetch from "node-fetch";

export async function apiPost(
  path: string,
  body: unknown,
  apiKey: string
) {
  const res = await fetch(`http://localhost:3000${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  return {
    status: res.status,
    body: json,
  };
}
