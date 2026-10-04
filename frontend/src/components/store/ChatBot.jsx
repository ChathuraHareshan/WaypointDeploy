import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Bot, X, ArrowLeft, Send } from "lucide-react";
import { useApp } from "../../context/AppContext";

const AI_SUGGESTIONS = ["Where's my latest order?", "Order cutoff time", "Report a delivery issue", "How do I place an order?"];

function buildReply(text, { orders = [], store, user }) {
  const q = text.toLowerCase();
  const latest = orders[0];
  const deferred = orders.filter((o) => o.status === "Deferred");
  const issues = orders.filter((o) => o.status === "Issue reported");

  if (/^(hi|hello|hey)\b/.test(q))
    return { text: `Hi ${user?.name?.split(" ").pop() || "there"}! I'm Waypoint Assist. I can help with orders, deliveries, and reports for ${store?.name || "your store"}.` };

  if (/(latest|last|recent|track|where).*(order|delivery)|order status|ord\d+/.test(q)) {
    const match = q.match(/ord\d+/i);
    const o = match ? orders.find((x) => x.id?.toLowerCase() === match[0]) : latest;
    if (!o) return { text: "I couldn't find that order. Check the ID on the My Orders page." };
    return {
      text: `${o.id} is "${o.status}". It has ${o.items} items (${o.chilled || 0} chilled), for delivery ${o.forDelivery}${o.expectedArrival && o.expectedArrival !== "—" ? `, expected around ${o.expectedArrival}` : ""}.`,
      action: { label: "View My Orders", to: "/store-manager/orders" },
    };
  }

  if (/defer/.test(q))
    return deferred.length
      ? { text: `You have ${deferred.length} deferred order: ${deferred.map((o) => o.id).join(", ")}. Deferred orders have no arrival time until rescheduled.`, action: { label: "View My Orders", to: "/store-manager/orders" } }
      : { text: "You have no deferred orders right now." };

  if (/cutoff|cut-off|deadline|last time/.test(q))
    return { text: "Orders for next-day delivery must be placed before the daily cutoff, shown in the header countdown. Orders after that move to the following delivery." };

  if (/(place|make|create|new).*(order)|how.*order/.test(q))
    return { text: "Open Place Order, pick items from the catalogue (chilled and ambient are flagged), set quantities, and submit before the cutoff.", action: { label: "Go to Place Order", to: "/store-manager/place-order" } };

  if (/issue|damage|missing|wrong|problem|report/.test(q))
    return {
      text: issues.length
        ? `To report a problem, open the delivery on the Receiving page during check-in. You currently have ${issues.length} order with an issue reported (${issues[0].id}).`
        : "To report a problem, open the delivery on the Receiving page during check-in and flag the affected items.",
      action: { label: "Go to Receiving", to: "/store-manager/receiving" },
    };

  if (/incoming|arriv|eta|truck/.test(q))
    return { text: "Check Incoming Delivery for live ETAs and what's on each truck.", action: { label: "Incoming Delivery", to: "/store-manager/incoming" } };

  if (/report|analytics|summary/.test(q))
    return { text: "The Reports page summarises your order history and delivery performance.", action: { label: "Open Reports", to: "/store-manager/reports" } };

  if (/thank/.test(q)) return { text: "You're welcome! Anything else I can help with?" };

  return { text: "I'm a demo assistant, so I only know a few topics: order status, cutoff times, placing orders, incoming deliveries, and reporting issues. Try one of those!" };
}

const LIVE_SUGGESTIONS = ["Talk to dispatch", "Question about an invoice", "Change a delivery slot"];

function ChatPanel({ title, subtitle, icon: HeaderIcon, messages, typing, suggestions, onSend, onBack, onClose, navigate }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const submit = (t) => {
    if (!t.trim() || typing) return;
    onSend(t.trim());
    setInput("");
  };

  return (
    <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white dark:bg-[#1E2530] text-gray-900 dark:text-white rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-scaleUp">
      <div className="bg-purplePrimary text-white px-4 py-3.5 flex items-center gap-2.5 shadow-sm">
        <button onClick={onBack} aria-label="Back" className="p-1 rounded-lg hover:bg-white/20 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <HeaderIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 leading-tight min-w-0">
          <p className="text-sm font-bold truncate">{title}</p>
          <p className="text-[11px] opacity-80 truncate">{subtitle}</p>
        </div>
        <button onClick={onClose} aria-label="Close chat" className="p-1 rounded-lg hover:bg-white/20 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9FB] dark:bg-[#151A22]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                  m.from === "user"
                    ? "bg-purplePrimary text-white rounded-br-sm shadow-sm"
                    : "bg-white dark:bg-[#243047] text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200/80 dark:border-gray-700/80 shadow-sm"
                }`}
              >
                {m.text}
              </div>
              {m.action && (
                <button
                  onClick={() => {
                    navigate(m.action.to);
                    onClose();
                  }}
                  className="mt-1.5 text-xs font-bold text-purplePrimary dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 px-3 py-1 rounded-full transition border border-purple-200/60 dark:border-purple-800"
                >
                  {m.action.label} →
                </button>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#243047] shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        {messages.length === 1 && !typing && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="text-[11px] font-semibold text-purplePrimary dark:text-purple-300 bg-white dark:bg-[#243047] border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-3 py-1.5 rounded-full transition text-left"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-white dark:bg-[#1E2530] border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <input
          className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-purplePrimary transition"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(input)}
        />
        <button
          onClick={() => submit(input)}
          disabled={!input.trim() || typing}
          aria-label="Send"
          className="w-9 h-9 shrink-0 rounded-xl bg-purplePrimary text-white hover:bg-neutral5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MenuButton({ label, onClick, className, children }) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        aria-label={label}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md ${className}`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </div>
  );
}

const LIVE_REPLIES = [
  "Thanks for reaching out! I'm Nimali from the Waypoint operations team. Let me check your route.",
  "Got it. I've noted that down and will coordinate with the dispatcher. Anything else you need?",
  "This is a demo chat. In live operations, your message routes directly to the Colombo depot operations desk.",
];

export default function ChatBot() {
  const app = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState("closed");
  const [typing, setTyping] = useState(false);
  const [aiMsgs, setAiMsgs] = useState([
    { from: "bot", text: "Hi! I'm Waypoint Assist. Ask me about your orders, cutoff times, or deliveries." },
  ]);
  const [liveMsgs, setLiveMsgs] = useState([
    { from: "bot", text: `Hi! You're chatting with Waypoint Operations for ${app.store?.name || "your store"}. How can we assist?` },
  ]);
  const timer = useRef(null);
  const liveIdx = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const reply = (setter, makeReply) => (text) => {
    setter((m) => [...m, { from: "user", text }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setter((m) => [...m, { from: "bot", ...makeReply(text) }]);
      setTyping(false);
    }, 800);
  };

  const sendAi = reply(setAiMsgs, (t) => buildReply(t, app));
  const sendLive = reply(setLiveMsgs, () => ({
    text: LIVE_REPLIES[Math.min(liveIdx.current++, LIVE_REPLIES.length - 1)],
  }));
  const close = () => setView("closed");
  const goMenu = () => setView("menu");

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {view === "ai" && (
        <ChatPanel
          title="Waypoint Assist"
          subtitle="AI Store Assistant"
          icon={Bot}
          messages={aiMsgs}
          typing={typing}
          suggestions={AI_SUGGESTIONS}
          onSend={sendAi}
          onBack={goMenu}
          onClose={close}
          navigate={navigate}
        />
      )}
      {view === "live" && (
        <ChatPanel
          title="Operations Desk"
          subtitle="Live Depot Support"
          icon={MessageSquare}
          messages={liveMsgs}
          typing={typing}
          suggestions={LIVE_SUGGESTIONS}
          onSend={sendLive}
          onBack={goMenu}
          onClose={close}
          navigate={navigate}
        />
      )}
      {view === "menu" ? (
        <div className="bg-white dark:bg-[#1E2530] rounded-full shadow-2xl border border-gray-200 dark:border-gray-800 p-1.5 flex flex-col gap-2 animate-scaleUp">
          <MenuButton label="AI assistant" onClick={() => setView("ai")} className="bg-purple-100 dark:bg-purple-950/60 text-purplePrimary dark:text-purple-300">
            <Bot className="w-5 h-5" />
          </MenuButton>
          <MenuButton label="Operations desk" onClick={() => setView("live")} className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <MessageSquare className="w-5 h-5" />
          </MenuButton>
          <MenuButton label="Close" onClick={close} className="bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </MenuButton>
        </div>
      ) : (
        <button
          onClick={() => setView(view === "closed" ? "menu" : "closed")}
          aria-label={view === "closed" ? "Open chat" : "Close chat"}
          className="w-12 h-12 rounded-full bg-white dark:bg-[#1E2530] text-purplePrimary shadow-xl border border-gray-200 dark:border-gray-800 hover:scale-105 transition flex items-center justify-center"
        >
          {view === "closed" ? <MessageSquare className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}
