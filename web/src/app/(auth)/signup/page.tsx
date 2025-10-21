"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const supabase = createSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="border rounded p-2 w-full"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="border rounded p-2 w-full"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="bg-black text-white rounded px-4 py-2 w-full">
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
