import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth, HOME, DEMO_USERS } from "../../auth";
import { User, Lock, ArrowRight, Zap } from "lucide-react";
export default function Login() {
  const [form, setForm] = useState({ username: "dispatcher", password: "dispatch123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = (u = form.username, p = form.password) => {
    setLoading(true);
    setError("");
    api
      .login(u, p)
      .then((res) => {
        const user = res.user || res;
        const token = res.token;
        login(user, token);
        navigate(HOME[user.role] || "/dispatcher");
      })
      .catch((err) => {
        setError(err.message || "Invalid username or password");
      })
      .finally(() => setLoading(false));
  };
  const handleQuickDemo = (demo) => {
    const pwd = demo.password || (demo.role === "DISPATCHER" ? "dispatch123" : demo.role === "LOADER" ? "loader123" : demo.role === "DRIVER" ? "driver123" : "store123");
    setForm({ username: demo.username, password: pwd });
    handleLogin(demo.username, pwd);
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
                WAYPOINT <span className="text-[11px] text-blue-600 dark:text-amber-400 font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 rounded">GROUP</span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 -mt-0.5 tracking-wider font-medium">Retail Distribution Network</div>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              LOGIN
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome to Waypoint Group Operations System
            </p>
          </div>
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold animate-shake">
              {error}
            </div>
          )}
          <div className="space-y-3.5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#EEF2F6] dark:bg-gray-800/80 border border-transparent focus:border-purplePrimary dark:focus:border-purplePrimary text-sm font-semibold text-gray-900 dark:text-white outline-none transition"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#EEF2F6] dark:bg-gray-800/80 border border-transparent focus:border-purplePrimary dark:focus:border-purplePrimary text-sm font-semibold text-gray-900 dark:text-white outline-none transition"
              />
            </div>
            <button
              onClick={() => handleLogin()}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4D4DE9] to-[#3B3BE8] hover:from-[#3D3DE0] hover:to-[#2B2BD8] text-white font-extrabold text-sm shadow-xl shadow-purplePrimary/35 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Login Now"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Judge & Demo Access (1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.username}
                  onClick={() => handleQuickDemo(demo)}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purplePrimary text-xs font-bold text-left transition flex items-center justify-between border border-purple-100 dark:border-purple-900/40"
                >
                  <span className="truncate">{demo.label}</span>
                  <span className="text-[10px] opacity-70">➜</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#4D4DE9] via-[#4545DE] to-[#3030BD] text-white p-12 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border-[40px] border-white/20 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full border-[60px] border-white/10 -ml-48 -mb-48" />
        </div>
        <div className="relative z-10 max-w-md w-full bg-white/15 backdrop-blur-xl p-8 rounded-3xl border border-white/25 shadow-2xl space-y-6">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white text-amber-500 flex items-center justify-center shadow-xl">
            <Zap className="w-7 h-7 fill-amber-400 text-amber-500" />
          </div>
          <div className="pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <img
                src="/logo-full.png"
                alt="Waypoint Group"
                className="h-9 object-contain drop-shadow"
              />
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white inline-block">
                Tech-Triathlon 2026
              </span>
            </div>
            <h2 className="text-2xl font-black leading-tight tracking-tight">
              Streamline your deliveries and optimize operations.
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Intelligent multi-role delivery planning engine connecting Dispatcher, Loader, Driver, and Store Manager across Peliyagoda and Kandy hubs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
