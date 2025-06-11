import { useParams } from "react-router";
import ModelSelector from "./ModelSelector";
import { SidebarTrigger } from "./ui/sidebar";
import { Textarea } from "./ui/textarea";

export default function ChatArea() {
  const { thread_id } = useParams();

  return (
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
  );
}
