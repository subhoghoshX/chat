import { useParams } from "react-router";
import ModelSelector from "./ModelSelector";
import { SidebarTrigger } from "./ui/sidebar";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Model } from "../../utils/supported-models";
import type { Id } from "convex/_generated/dataModel";
import { marked } from "marked";
import { Button } from "./ui/button";
import { ArrowUp, Plus } from "lucide-react";

export default function ChatArea() {
  const { threadId } = useParams();
  const messages = useQuery(api.messages.getMessages, threadId ? { threadId } : "skip");

  const createMessage = useMutation(api.messages.createMessage).withOptimisticUpdate((localStore, args) => {
    const prevMessages = localStore.getQuery(api.messages.getMessages, { threadId: args.threadId });

    if (prevMessages !== undefined) {
      localStore.setQuery(api.messages.getMessages, { threadId: args.threadId }, [
        ...prevMessages,
        { _id: crypto.randomUUID() as Id<"messages">, _creationTime: Date.now(), ...args },
      ]);
    }
  });

  const [selectedModel, setSelectedModel] = useState<Model>("vertex/gemini-2.0-flash-001");

  return (
    <main className="relative grow h-screen overflow-hidden">
      <SidebarTrigger className="absolute left-2 top-2" />
      <div className="overflow-auto h-full pt-4 pb-48">
        <article className="max-w-3xl mx-auto space-y-5">
          {messages?.map((message) => <ChatBubble key={message._id} content={message.content} by={message.by} />)}
        </article>
      </div>
      <form className="absolute max-w-3xl w-full bottom-0 left-1/2 -translate-x-1/2 border p-2 rounded-t-xl shadow bg-white/85 dark:bg-neutral-900/85 backdrop-blur">
        <Textarea
          id="prompt-input"
          ref={(ref) => ref?.focus()}
          className="rounded-md p-3 resize-none focus-visible:ring-0 focus-visible:border-input"
          placeholder="Ask anything..."
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (e.target instanceof HTMLTextAreaElement && threadId && e.target.value) {
                await createMessage({ threadId, content: e.target.value, by: "human", model: selectedModel });
                e.target.value = "";
              }
            }
          }}
        />
        <div className="mt-2 flex gap-1">
          <ModelSelector selectedModel={selectedModel} onChange={(model) => setSelectedModel(model)} />
          <Button variant="ghost" size="sm" type="button">
            <Plus /> Add files
          </Button>
          <Button
            size="sm"
            className="ml-auto"
            type="button"
            onClick={() => {
              const textarea = document.getElementById("prompt-input");
              if (textarea instanceof HTMLTextAreaElement && threadId && textarea.value) {
                createMessage({ threadId, content: textarea.value, by: "human", model: selectedModel });
                textarea.value = "";
              }
            }}
          >
            Send <ArrowUp />
          </Button>
        </div>
      </form>
    </main>
  );
}

interface ChatBubbleProps {
  content: string;
  by: string;
}
function ChatBubble({ content, by }: ChatBubbleProps) {
  if (!content && by !== "human") {
    return <AnimatingChatBubble />;
  }
  return (
    <section
      className={cn("rounded-lg px-4 py-2 prose dark:prose-invert max-w-none", {
        "bg-neutral-100 dark:bg-neutral-900 w-fit ml-auto": by === "human",
      })}
      dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
    />
  );
}

function AnimatingChatBubble() {
  return (
    <div className="flex w-fit gap-1 h-11 items-center px-4">
      <span className="size-2 animate-bounce rounded-full bg-neutral-300 dark:bg-neutral-900"></span>
      <span className="size-2 animate-bounce [animation-delay:300ms] [animation-fill-mode:both] rounded-full bg-neutral-300 dark:bg-neutral-900"></span>
      <span className="size-2 animate-bounce [animation-delay:600ms] [animation-fill-mode:both] rounded-full bg-neutral-300 dark:bg-neutral-900"></span>
    </div>
  );
}
