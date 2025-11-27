// src/Pages/loginpage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../../assets/logo.png";
import api from "../../../../utils/api";

const BRAND = {
  primary: "#D4AF37",
  primaryDark: "#A8841A",
  primarySoft: "#FFF4CF",
  ink: "#0F172A",
  text: "#1F2937",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Ensure axios has token on mount (if user already logged in)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      const msg = "Fill in all fields";
      setAlert({ type: "error", text: msg });
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      setAlert({ type: "", text: "" });

      // NOTE: baseURL already includes /api, so endpoint is /user/login
      const res = await api.post("/user/login", {
        email: emailTrimmed,
        password,
      });

      const { data } = res;

      // Save token + user
      if (data?.token) {
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const okMsg = data?.message || "Welcome back!";
      setAlert({ type: "success", text: okMsg });
      toast.success(okMsg, { duration: 2000 }); // Shorter duration for admin login

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect based on role
      if (data?.user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const resp = err?.response;
      let msg = "Login failed";

      // helpful diagnostics in dev tools
      try {
        console.groupCollapsed("Login error");
        console.log("status:", resp?.status);
        console.log("data:", resp?.data);
        console.log("message:", err?.message);
        console.groupEnd();
      } catch {
        // ignore
      }

      if (!resp) {
        msg = "Cannot reach server. Check backend URL and network.";
      } else if (resp.status === 401) {
        msg = resp.data?.message || "Invalid email or password";
      } else if (resp.status === 403) {
        msg = resp.data?.message || "Forbidden";
      } else if (resp.status === 400) {
        msg = resp.data?.message || "Missing or invalid fields";
      } else if (resp.status >= 500) {
        msg = resp.data?.message || "Server error. Please try again.";
      } else {
        msg = resp.data?.message || msg;
      }

      setAlert({ type: "error", text: msg });
      toast.error(msg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(1100px 600px at 15% 10%, ${BRAND.primarySoft}, #ffffff 55%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -top-28 -left-28 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-50 -z-10"
        style={{ background: BRAND.primary }}
      />
      <div
        className="pointer-events-none absolute -bottom-28 -right-28 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-30 -z-10"
        style={{ background: BRAND.primary }}
      />

      <div className="flex items-center max-w-6xl min-h-screen px-4 mx-auto sm:px-6">
        <aside className="hidden w-1/2 pr-8 md:flex">
          <div className="w-full p-8 border shadow-2xl rounded-3xl bg-white/90 backdrop-blur-xl border-white/60">
            <div className="flex items-center gap-4">
              <div
                className="grid w-16 h-16 overflow-hidden rounded-full shadow-md ring-4 ring-white/80 place-items-center"
                style={{ background: BRAND.primary }}
                aria-hidden
              >
                <img src={logo} alt="Hasthi logo" className="object-cover h-14 w-14" />
              </div>
              <div>
                <h1
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: BRAND.ink }}
                >
                  Hasthi Safari Cottage
                </h1>
                <p className="text-slate-600">Wild comfort. Natural luxury.</p>
              </div>
            </div>

            <ul className="grid gap-3 mt-8 text-slate-700">
              <li className="flex items-center gap-2">🏨 Premium rooms & suites</li>
              <li className="flex items-center gap-2">🦁 Safari packages & guided tours</li>
              <li className="flex items-center gap-2">🍽️ All-day dining & room service</li>
              <li className="flex items-center gap-2">🛜 Fast & secure portal</li>
            </ul>

            <p className="mt-10 text-xs text-slate-500">
              © {new Date().getFullYear()} Hasthi Safari Cottage. All rights reserved.
            </p>
          </div>
        </aside>

        <main className="w-full md:w-1/2">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md p-8 mx-auto border shadow-2xl rounded-3xl bg-white/95 backdrop-blur-xl border-white/70"
          >
            <div className="mb-6 text-center">
              <div
                className="grid w-16 h-16 mx-auto mb-4 overflow-hidden rounded-full shadow-md ring-4 ring-white/80 place-items-center"
                style={{ background: BRAND.primary }}
              >
                <img src={logo} alt="Hasthi logo" className="object-cover h-14 w-14" />
              </div>
              <h2
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: BRAND.ink }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-slate-600">
                Sign in to manage bookings and stays.
              </p>
            </div>

            {alert.text && (
              <div
                role="alert"
                className={`mb-4 text-sm rounded-2xl border p-3 ${
                  alert.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {alert.text}
              </div>
            )}

            <label
              htmlFor="email"
              className="block text-sm font-medium"
              style={{ color: BRAND.ink }}
            >
              Email
            </label>
            <div className="relative mt-1 mb-4">
              <span className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2">
                📧
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full h-12 pl-10 pr-3 transition border outline-none rounded-2xl bg-white/90"
                style={{ borderColor: "#E5E7EB" }}
                required
                autoComplete="username"
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND.primary}33`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: BRAND.ink }}
            >
              Password
            </label>
            <div className="relative mt-1 mb-2">
              <span className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2">
                🔒
              </span>
              <input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-10 transition border outline-none rounded-2xl bg-white/90 pr-14"
                style={{ borderColor: "#E5E7EB" }}
                required
                autoComplete="current-password"
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND.primary}33`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute px-2 py-1 text-sm -translate-y-1/2 rounded-lg right-3 top-1/2"
                style={{ color: BRAND.primaryDark, backgroundColor: BRAND.primarySoft }}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 text-sm">
              <label className="inline-flex items-center gap-2 select-none text-slate-700">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300" />
                Remember me
              </label>
              <Link to="/forgot" className="hover:underline" style={{ color: BRAND.primaryDark }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full h-12 rounded-2xl text-white font-semibold shadow active:scale-[0.99] transition disabled:opacity-60"
              style={{
                backgroundImage: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              }}
            >
              {loading ? "Logging in…" : "Login"}
            </button>

            <div className="grid gap-2 mt-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">New here?</span>
                <Link to="/register" className="hover:underline" style={{ color: BRAND.primaryDark }}>
                  Create account
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Read our</span>
                <Link to="/policies" className="hover:underline" style={{ color: BRAND.primaryDark }}>
                  Booking & Privacy Policies
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Need help?</span>
                <Link to="/contact" className="hover:underline" style={{ color: BRAND.primaryDark }}>
                  Contact support
                </Link>
              </div>
            </div>
          </form>
        </main>
      </div>

      <style>{`
        @keyframes rise { from { transform: translateY(8px); opacity: .0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes fadeIn { from { opacity: .0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
