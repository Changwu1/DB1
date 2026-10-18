"use server";

import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
};

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const nickname = formData.get("nickname") as string;
  const password = formData.get("password") as string;

  if (!email || !nickname || !password) {
    return { error: "All fields are required." };
  }
  if (nickname.trim().length < 2) {
    return { error: "Nickname must be at least 2 characters." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Signup failed. Please try again." };
  }

  // Create profile immediately (before email confirmation, if required).
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    nickname: nickname.trim(),
  });

  if (profileError && profileError.code !== "23505") {
    // 23505 = unique violation — profile already exists, safe to ignore.
    return { error: "Could not create your profile. Please try again." };
  }

  await trackEvent("user_signed_up", data.user.id, { email }, "auth/signup");

  // If no session, email confirmation is required.
  if (!data.session) {
    redirect("/auth/verify-email");
  }

  redirect("/onboarding/disclaimer");
}

export async function logIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  await trackEvent("user_logged_in", data.user.id, {}, "auth/login");

  redirect("/");
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function acknowledgeDisclaimer(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  await supabase
    .from("profiles")
    .update({ disclaimer_acknowledged_at: new Date().toISOString() })
    .eq("id", user.id);

  await trackEvent(
    "disclaimer_acknowledged",
    user.id,
    {},
    "onboarding/disclaimer"
  );

  redirect("/onboarding/consent");
}

const CONSENT_VERSION = "v1";

export async function giveConsent(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  await supabase
    .from("profiles")
    .update({
      consent_version: CONSENT_VERSION,
      consent_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await trackEvent("consent_given", user.id, { consent_version: CONSENT_VERSION }, "onboarding/consent");

  redirect("/assessment");
}
