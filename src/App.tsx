import { Route, Routes } from "react-router";
import ChatArea from "./components/ChatArea";
import { SidebarProvider } from "./components/ui/sidebar";
import { useConvexAuth } from "convex/react";
import SidebarForAuthenticatedUser from "./components/sidebar/SidebarForAuthenticatedUser";
import SidebarForUnauthenticatedUser from "./components/sidebar/SidebarForUnauthenticatedUser";

export default function App() {
  const auth = useConvexAuth();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      {auth.isAuthenticated ? <SidebarForAuthenticatedUser /> : <SidebarForUnauthenticatedUser />}

      <Routes>
        <Route path="/" element={<ChatArea />} />
        <Route path="/chat/:threadId" element={<ChatArea />} />
      </Routes>
    </SidebarProvider>
  );
}
