import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AnimatedButton from "../components/AnimatedButton.jsx";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const addToast = useAppStore((state) => state.addToast);
  const login = useAuthStore((state) => state.login);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      addToast("error", "Please fill in all fields");
      return;
    }

    const result = await login({ identifier, password });
    if (!result.ok) {
      addToast("error", result.message);
      return;
    }

    addToast("success", "Welcome back");
    const currentUser = useAuthStore.getState().user;
    const redirectPath =
      location.state?.from || (currentUser?.role === "admin" ? "/admin" : "/");
    navigate(redirectPath, { replace: true });
  };

  return (
    <section className="mx-auto max-w-lg">
      <div className="glass-panel p-8">
        <div className="mb-5 flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="VidVortex logo"
            className="h-10 w-10 rounded-xl border border-white/20 object-cover shadow-cyan"
          />
          <div>
            <p className="font-display text-lg text-white">VidVortex</p>
            <p className="text-xs text-brand-muted">Premium Creator Platform</p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">
          VidVortex Account
        </p>
        <h1 className="mt-3 font-display text-3xl text-white">Sign In</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Access upload tools, profile analytics, and personalized timeline
          data.
        </p>

        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Username or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />

          <AnimatedButton
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-3 text-center disabled:opacity-60"
          >
            {isAuthLoading ? "Signing in..." : "Sign In"}
          </AnimatedButton>
        </form>

        <p className="mt-5 text-sm text-brand-muted">
          New to VidVortex?{" "}
          <Link to="/register" className="text-brand-accent">
            Create account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
