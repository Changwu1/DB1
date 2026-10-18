"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { submitFeedback, type FeedbackState } from "@/app/actions/feedback";
import { strings } from "@/strings/en";

const initialState: FeedbackState = {};

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [state, action, pending] = useActionState(submitFeedback, initialState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close and reset after successful submission
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => setOpen(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        aria-label={strings.feedback.title}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
        </svg>
        {strings.feedback.title}
      </button>

      {/* Backdrop + modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-label={strings.feedback.title}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {strings.feedback.title}
            </h2>

            {state.success ? (
              <p className="text-sm text-green-700">{strings.feedback.successMessage}</p>
            ) : (
              <form action={action} className="flex flex-col gap-4">
                <input type="hidden" name="pageContext" value={pathname} />
                <textarea
                  ref={textareaRef}
                  name="text"
                  rows={4}
                  placeholder={strings.feedback.placeholder}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
                {state.error && (
                  <p className="text-sm text-red-600" role="alert">
                    {state.error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                >
                  {pending ? "Sending…" : strings.feedback.cta}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
