import { Route, Routes, useParams } from "react-router";
import ChatArea from "./components/ChatArea";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSidebar from "./components/sidebar/AppSidebar";
import Settings from "./components/Settings";
import { useEffect } from "react";
import { applyColorScheme } from "./lib/colorscheme";
import SharedThread from "./components/SharedThread";

export default function App() {
  const { "*": path } = useParams();

  useEffect(() => {
    const colorschemeName = localStorage.getItem("colorscheme");
    if (colorschemeName === null || colorschemeName === "default") {
      return;
    } else {
      applyColorScheme(colorschemeName);
    }
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": path !== "settings" ? "350px" : "49px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />

      <Routes>
        <Route path="/" element={<ChatArea />} />
        <Route path="/chat/:threadId" element={<ChatArea />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/shared/:_threadId" element={<SharedThread />} />
      </Routes>
    </SidebarProvider>
  );
}
