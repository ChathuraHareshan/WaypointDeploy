import { useTheme } from "../../context/ThemeContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatBot from "./ChatBot";

export default function Layout({ title, children }) {
  const { mode } = useTheme();
  return (
    <div className={`h-screen flex flex-col md:flex-row overflow-hidden ${mode === "evening" ? "dark bg-[#151A22] text-[#F0E9DD]" : "bg-[#F7F9FB] text-[#12181F]"} font-sans transition-colors duration-200`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">{children}</main>
      </div>
      <ChatBot />
    </div>
  );
}
