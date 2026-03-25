"use client";

import { useEffect, useState } from "react";
import {
  getStoredAdminToken,
  LAUNCH_ADMIN_TOKEN_KEY,
} from "@/components/admin/adminTokenStorage";

export function AdminTokenGate() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    setToken(getStoredAdminToken());
  }, []);

  const save = () => {
    const t = input.trim();
    sessionStorage.setItem(LAUNCH_ADMIN_TOKEN_KEY, t);
    setToken(t);
  };

  const clear = () => {
    sessionStorage.removeItem(LAUNCH_ADMIN_TOKEN_KEY);
    setToken("");
    setInput("");
  };

  return (
    <div className="mb-6 rounded-lg border border-launch-steel/25 bg-black/20 p-4 text-sm">
      <p className="mb-2 text-launch-muted">
        Use the same value as{" "}
        <code className="text-launch-soft">LAUNCH_ADMIN_SECRET</code> in{" "}
        <code className="text-launch-soft">.env.local</code>. Stored in
        sessionStorage for this browser only.
      </p>
      {token ? (
        <p className="text-launch-soft">
          Token is set.{" "}
          <button
            type="button"
            onClick={clear}
            className="ml-2 text-launch-gold underline"
          >
            Clear
          </button>
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin secret"
            className="min-w-[12rem] flex-1 rounded border border-launch-steel/30 bg-black/30 p-2"
          />
          <button
            type="button"
            onClick={save}
            className="rounded bg-launch-steel/40 px-3 py-2"
          >
            Store token
          </button>
        </div>
      )}
    </div>
  );
}
