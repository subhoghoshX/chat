import { useParams } from "react-router";
import ModelSelector from "./ModelSelector";
import { SidebarTrigger } from "./ui/sidebar";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Model } from "../../utils/supported-models";

export default function ChatArea() {
  const { thread_id } = useParams();
  const messages = useQuery(api.messages.getMessages, { thread_id });
  const createMessage = useMutation(api.messages.createMessage);

  const [selectedModel, setSelectedModel] = useState<Model>("vertex/gemini-2.0-flash-001");

  return (
    <main className="relative grow h-screen overflow-hidden">
      <SidebarTrigger className="absolute left-2 top-2" />
      <div className="overflow-auto h-full pt-4 pb-48">
        <article className="max-w-3xl mx-auto space-y-5">
          {messages?.map((message) => <ChatBubble key={message._id} content={message.content} by={message.by} />)}
        </article>
      </div>
      <form className="absolute max-w-3xl w-full bottom-0 left-1/2 -translate-x-1/2">
        <Textarea
          className="rounded-b-none border-b-0 rounded-t-xl pt-3 pb-15 min-h-28 resize-none bg-white/85 dark:bg-neutral-900/85 backdrop-blur shadow"
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (e.target instanceof HTMLTextAreaElement && thread_id) {
                createMessage({ thread_id, content: e.target.value, by: "human", model: selectedModel });
                e.target.value = "";
              }
            }
          }}
        />
        <ModelSelector
          className="absolute bottom-3 left-3"
          selectedModel={selectedModel}
          onChange={(model) => setSelectedModel(model)}
        />
      </form>
    </main>
  );
}

interface ChatBubbleProps {
  content: string;
  by: string;
}
function ChatBubble({ content, by }: ChatBubbleProps) {
  return (
    <section
      className={cn("rounded-lg px-4 py-2", { "bg-neutral-100 dark:bg-neutral-900 w-fit ml-auto": by === "human" })}
    >
      {content}
    </section>
  );
}
