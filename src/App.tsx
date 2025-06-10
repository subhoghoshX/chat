import AppSidebar from "./components/AppSidebar";
import ModelSelector from "./components/ModelSelector";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Textarea } from "./components/ui/textarea";

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

      <main className="p-2 relative grow overflow-hidden">
        <SidebarTrigger />
        <form className="absolute max-w-2xl w-full bottom-0 left-1/2 -translate-x-1/2">
          <Textarea
            className="rounded-b-none border-b-0 rounded-t-xl pt-3 pb-15 min-h-28 resize-none"
            placeholder="Type your message here..."
          />
          <ModelSelector className="absolute bottom-3 left-3" />
        </form>
      </main>
    </SidebarProvider>
  );
}
