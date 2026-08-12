"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Password gate — protects a page behind a password.
 * Checks password against the same DASHBOARD_PASSWORD via the API.
 * Reuses the same password as the dashboard.
 */
export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  // Check for saved password on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("kismet-tool-pw");
    if (saved) {
      verifyPassword(saved);
    }
  }, []);

  const verifyPassword = async (pw: string) => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/submit-form?action=list", {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (res.status === 200) {
        setUnlocked(true);
        sessionStorage.setItem("kismet-tool-pw", pw);
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Failed to verify. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) verifyPassword(password);
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🔐</div>
            <h2 className="text-xl font-semibold">Private Tool</h2>
            <p className="text-sm text-muted-foreground">
              This tool is not publicly available. Enter the password to continue.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tool-password">Password</Label>
              <Input
                id="tool-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">⚠ {error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={!password || checking}>
              {checking ? "Verifying..." : "Unlock"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
