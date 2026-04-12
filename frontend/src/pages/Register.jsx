import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnimatedButton from "../components/AnimatedButton.jsx";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

function Register() {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const addToast = useAppStore((state) => state.addToast);
  const register = useAuthStore((state) => state.register);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!fullname.trim() || !username.trim() || !email.trim() || !password) {
      addToast("error", "Please fill in all fields");
      return;
    }

    const result = await register({ fullname, username, email, password });
    if (!result.ok) {
      addToast("error", result.message);
      return;
    }

    addToast("success", result.message || "Account created");
    navigate("/login", { replace: true });
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
          Launch Your Channel
        </p>
        <h1 className="mt-3 font-display text-3xl text-white">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          Start publishing stories and track real viewer moments.
        </p>

        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={fullname}
            onChange={(event) => setFullname(event.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/15 bg-brand-surface px-4 py-3 text-sm text-white outline-none"
          />

          <AnimatedButton
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-3 text-center disabled:opacity-60"
          >
            {isAuthLoading ? "Creating..." : "Create Account"}
          </AnimatedButton>
        </form>

        <p className="mt-5 text-sm text-brand-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-accent">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
