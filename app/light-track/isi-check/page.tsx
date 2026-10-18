import { Suspense } from "react";
import { IsiCheckClient } from "./IsiCheckClient";

export default function LightIsiCheckPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-gray-500">Loading…</div>}>
      <IsiCheckClient />
    </Suspense>
  );
}
