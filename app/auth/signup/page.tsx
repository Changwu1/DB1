"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { strings } from "@/strings/en";

const s = strings.auth;
const initialState: AuthState = {};

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{strings.app.name}</h1>
        <p className="mt-1 text-gray-500">{s.signupTitle}</p>
      </div>

      <form action={action} className="flex flex-col gap-5">
        <Input
          label={s.emailLabel}
          name="email"
          type="email"
          autoComplete="email"
          required
          inputMode="email"
        />
        <Input
          label={s.nicknameLabel}
          name="nickname"
          type="text"
          placeholder={s.nicknamePlaceholder}
          autoComplete="nickname"
          required
        />
        <Input
          label={s.passwordLabel}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters"
        />

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" fullWidth loading={pending}>
          {s.signupCta}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {s.alreadyHaveAccount}{" "}
        <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">
          {s.signInLink}
        </Link>
      </p>
    </main>
  );
}
