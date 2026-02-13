import { useState } from "react";

export function useSummarize() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function summarize(params: {
    apiKey: string;
    text: string;
    style: string;
    language: string;
  }) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/v1/tasks/text-summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.apiKey}`,
        },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "API error");

      setResult(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { summarize, loading, result, error };
}
