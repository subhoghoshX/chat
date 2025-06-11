import { Route, Routes } from "react-router";
import AppSidebar from "./components/AppSidebar";
import ChatArea from "./components/ChatArea";
import { SidebarProvider } from "./components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />

      <Routes>
        <Route path="/" element={<ChatArea />} />
        <Route path="/chat/:thread_id" element={<ChatArea />} />
      </Routes>
    </SidebarProvider>
  );
}
