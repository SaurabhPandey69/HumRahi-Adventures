export async function trackEvent(event: string, data: any = {}) {
  try {
    const res = await fetch("/api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        app: "HumRahi Adventures", // ✅ Added for multi-brand future scaling
        ...data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.error("Event tracking failed:", event);
    }

    return res;
  } catch (error) {
    console.error("Tracking error:", error);
  }
}
