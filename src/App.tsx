import { Route, Routes } from "react-router";
import ChatArea from "./components/ChatArea";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSidebar from "./components/sidebar/AppSidebar";

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
        <Route path="/chat/:threadId" element={<ChatArea />} />
      </Routes>
    </SidebarProvider>
  );
}
