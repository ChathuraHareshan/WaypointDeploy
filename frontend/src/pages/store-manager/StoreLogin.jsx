import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { User, Lock, ArrowRight, Store, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Login() {
  const { login, loginSso } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ssoStarted = useRef(false);

  useEffect(() => {
    if (params.get("from") === "unified-login" && !ssoStarted.current) {
      ssoStarted.current = true;
      const name = params.get("name") || params.get("user") || "Store Manager";
      try {
        localStorage.setItem(
          "waypoint_auth",
          JSON.stringify({
            id: params.get("user"),
            name,
            role: params.get("role"),
          })
        );
      } catch (_) {}
      loginSso(params.get("user"))
        .then(() => navigate("/store-manager/dashboard", { replace: true }))
        .catch((err) => console.error("Unified login hand-off failed:", err.message));
    }
  }, [params, navigate, loginSso]);

  const [username, setUsername] = useState("out001");
  const [password, setPassword] = useState("store123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/store-manager/dashboard");
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F7F9FB] dark:bg-[#151A22] font-sans">
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo-icon.png"
              alt="Waypoint Logo"
              className="w-12 h-12 object-contain drop-shadow-md"
            />
            <div>
              <div className="font-black text-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                WAYPOINT <span className="text-[11px] text-blue-600 dark:text-amber-400 font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 rounded">STORE</span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 -mt-0.5 tracking-wider font-medium">Store Manager Portal</div>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              STORE LOGIN
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to manage your store orders, deliveries, and receipts
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Store Account ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. out001"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E2530] text-sm text-gray-900 dark:text-white outline-none focus:border-purplePrimary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E2530] text-sm text-gray-900 dark:text-white outline-none focus:border-purplePrimary transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? "Authenticating..." : "Sign In to Store Portal"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-purplePrimary dark:text-purple-400 hover:underline"
            >
              ← Back to Unified System Login
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex bg-gradient-to-br from-purplePrimary via-indigo-600 to-purple-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold">
            <Store className="w-3.5 h-3.5 text-amber-300" />
            Retail Outlet Integration
          </div>
          <h2 className="text-3xl font-black leading-tight max-w-md">
            Directly Connected with Operations Dispatcher
          </h2>
          <p className="text-purple-100 text-sm max-w-sm leading-relaxed">
            Submit orders before 4:00 PM for next-day delivery, inspect incoming manifests in real-time, and verify receipts on the dock.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 max-w-md">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            Active Depot Link
          </div>
          <p className="text-xs text-purple-100">
            Real-time synchronization with the Peliyagoda Distribution Center. All orders validate against warehouse catalog inventory and vehicle trip quotas.
          </p>
        </div>
      </div>
    </div>
  );
}
