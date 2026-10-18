"use server";

import { createClient } from "@/lib/supabase/server";

export type FeedbackState = {
  success?: boolean;
  error?: string;
};

export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  const text = (formData.get("text") as string)?.trim();
  const pageContext = formData.get("pageContext") as string | null;

  if (!text || text.length === 0) {
    return { error: "Please write something before sending." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    text,
    page_context: pageContext ?? null,
  });

  if (error) {
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
