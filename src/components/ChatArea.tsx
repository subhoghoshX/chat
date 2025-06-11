import { useParams } from "react-router";
import ModelSelector from "./ModelSelector";
import { SidebarTrigger } from "./ui/sidebar";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ChatArea() {
  const { thread_id } = useParams();
  const messages = useQuery(api.messages.getMessages, { thread_id });
  const createMessage = useMutation(api.messages.createMessage);

  return (
    <main className="p-2 relative grow overflow-hidden">
      <SidebarTrigger />
      <article>{messages?.map((message) => <section key={message._id}>{message.content}</section>)}</article>
      <form className="absolute max-w-2xl w-full bottom-0 left-1/2 -translate-x-1/2">
        <Textarea
          className="rounded-b-none border-b-0 rounded-t-xl pt-3 pb-15 min-h-28 resize-none"
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (e.target instanceof HTMLTextAreaElement && thread_id) {
                createMessage({ thread_id, content: e.target.value, by: "human" });
                e.target.value = "";
              }
            }
          }}
        />
        <ModelSelector className="absolute bottom-3 left-3" />
      </form>
    </main>
  );
}
