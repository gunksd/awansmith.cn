"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          页面出了点问题
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          抱歉，页面加载时遇到了错误。请尝试刷新页面。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
