import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-5xl mb-6">📬</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
      <p className="text-gray-500 mb-8 max-w-xs">
        We sent a confirmation link to your email address. Click it to activate your account, then come back here.
      </p>
      <Link
        href="/auth/login"
        className="text-sm font-medium text-indigo-600 hover:underline"
      >
        Back to sign in
      </Link>
    </main>
  );
}
