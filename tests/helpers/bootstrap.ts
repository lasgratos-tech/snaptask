import fetch from "node-fetch";

export async function bootstrapDev() {
  const res = await fetch("http://localhost:3000/_internal/bootstrap", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Bootstrap failed");
  }

  return res.json() as Promise<{
    apiKey: string;
    userId: string;
  }>;
}
