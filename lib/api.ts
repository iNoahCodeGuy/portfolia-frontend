// Inlined at build time. A production build missing the env var used to
// fall back to localhost — every chat request then fails with a misleading
// network error. Keep the localhost convenience for dev only and fail
// loudly in prod, where the only correct value comes from Vercel env.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

export async function sendMessage(
  message: string,
  sessionId: string | null,
  role?: string,
): Promise<{ response: string; sessionId: string; form: "crush" | "contact" | null }> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set — the production build has no backend to talk to",
    );
  }
  const payload: Record<string, unknown> = {
    message,
    session_id: sessionId,
  };
  if (role) {
    payload.role = role;
  }

  // Generation can take a while, but a hung request should not spin forever
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    response: data.response,
    sessionId: data.session_id,
    // Structured form signal (older backends omit it — null means no form)
    form: data.form ?? null,
  };
}
