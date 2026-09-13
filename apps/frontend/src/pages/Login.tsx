import { useState } from "react";
import { login, signup, getMe, type AuthUser } from "../api/auth";
import { ApiError } from "../api/client";
import { dotGridStyle } from "../theme";

type LoginProps = {
  onAuthenticated: (user: AuthUser) => void;
};

type Mode = "login" | "signup";

export function Login({ onAuthenticated }: LoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        await signup(email, username, password);
      }
      await login(email, password);
      const me = await getMe();
      onAuthenticated(me.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]" style={dotGridStyle}>
      <div className="w-full max-w-sm rounded-2xl border border-[#e0dfff] bg-white p-8 shadow-[0_4px_24px_rgba(105,101,219,0.15)]">
        <h1
          className="mb-1 text-center text-5xl text-[#6965db]"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          sanchitra
        </h1>
        <p className="mb-6 text-center text-sm text-[#6b6b6b]">A collaborative whiteboard</p>

        <div className="mb-6 flex rounded-lg bg-[#f5f5f9] p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === "login" ? "bg-white text-[#6965db] shadow-sm" : "text-[#6b6b6b]"
            }`}
            onClick={() => switchMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === "signup" ? "bg-white text-[#6965db] shadow-sm" : "text-[#6b6b6b]"
            }`}
            onClick={() => switchMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <label className="flex flex-col gap-1 text-sm text-[#1e1e1e]">
              Username
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-lg border border-[#e0dfff] px-3 py-2 outline-none focus:border-[#6965db] focus:ring-2 focus:ring-[#6965db]/20"
                placeholder="jane"
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm text-[#1e1e1e]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-[#e0dfff] px-3 py-2 outline-none focus:border-[#6965db] focus:ring-2 focus:ring-[#6965db]/20"
              placeholder="jane@example.com"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#1e1e1e]">
            Password
            <input
              type="password"
              required
              minLength={8}
              maxLength={20}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[#e0dfff] px-3 py-2 outline-none focus:border-[#6965db] focus:ring-2 focus:ring-[#6965db]/20"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-[#e03131]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-[#6965db] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5b57d1] disabled:opacity-60"
          >
            {isSubmitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b6b6b]">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button type="button" className="font-medium text-[#6965db]" onClick={() => switchMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" className="font-medium text-[#6965db]" onClick={() => switchMode("login")}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
