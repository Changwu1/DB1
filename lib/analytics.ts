import { createClient } from "@/lib/supabase/server";

// Fire an analytics event. Never throws — analytics must never break the user flow.
export async function trackEvent(
  eventName: string,
  userId: string | null,
  metadata: Record<string, unknown> = {},
  pageContext?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("analytics_events").insert({
      user_id: userId ?? null,
      event_name: eventName,
      metadata: metadata as import("@/lib/types/database").Json,
      page_context: pageContext ?? null,
    });
  } catch {
    // Intentionally swallowed — see above.
  }
}
