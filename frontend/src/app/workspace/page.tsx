"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkspacePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ai-assistant");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-500">
      <span>Redirecting to AI Assistant Workspace...</span>
    </div>
  );
}
