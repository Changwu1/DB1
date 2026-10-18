import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { strings } from "@/strings/en";

export const instant = false;

// This page is protected by proxy.ts — only ADMIN_EMAIL can reach it.

async function getSignups() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nickname, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

async function getRoutingOutcomes() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("assessment_1")
    .select("routing_decision")
    .not("routing_decision", "is", null);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.routing_decision) {
      counts[row.routing_decision] = (counts[row.routing_decision] ?? 0) + 1;
    }
  }
  return counts;
}

async function getFeedback() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("feedback")
    .select("id, text, page_context, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export default async function AdminPage() {
  await cookies(); // opts into dynamic rendering — admin data is never cacheable
  const [signups, routingOutcomes, feedback] = await Promise.all([
    getSignups(),
    getRoutingOutcomes(),
    getFeedback(),
  ]);

  return (
    <main className="px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{strings.admin.title}</h1>

      {/* Signups */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          {strings.admin.signupsTab} ({signups.length})
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nickname</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Signed up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {signups.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-gray-900">{u.nickname}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.created_at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
              {signups.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-gray-400">
                    No signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Routing outcomes */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          {strings.admin.routingTab}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(routingOutcomes).map(([decision, count]) => (
            <div key={decision} className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-2xl font-bold text-indigo-600">{count}</p>
              <p className="mt-1 text-xs text-gray-500 break-all">{decision}</p>
            </div>
          ))}
          {Object.keys(routingOutcomes).length === 0 && (
            <p className="col-span-3 text-sm text-gray-400">No assessments completed yet.</p>
          )}
        </div>
      </section>

      {/* Feedback */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          {strings.admin.feedbackTab} ({feedback.length})
        </h2>
        <div className="flex flex-col gap-3">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{f.text}</p>
              <div className="mt-2 flex gap-3 text-xs text-gray-400">
                <span>{f.page_context ?? "unknown page"}</span>
                <span>
                  {new Date(f.created_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          ))}
          {feedback.length === 0 && (
            <p className="text-sm text-gray-400">No feedback yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
