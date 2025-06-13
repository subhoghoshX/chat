import { useNavigate, useParams } from "react-router";
import ModelSelector from "./ModelSelector";
import { SidebarTrigger } from "./ui/sidebar";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
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

  const createThread = useMutation(api.threads.createThread).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.threads.getThreads, {});

    if (prevThreads !== undefined) {
      localStore.setQuery(api.threads.getThreads, {}, [
        ...prevThreads,
        {
          _id: crypto.randomUUID() as Id<"threads">,
          _creationTime: Date.now(),
          ...args,
          title: "New Thread",
          isPublic: false,
        },
      ]);
    }
  });

  const [selectedModel, setSelectedModel] = useState<Model>("vertex/gemini-2.0-flash-001");

  const navigate = useNavigate();

  function submitFormHandler(prompt: string) {
    if (threadId) {
      createMessage({ threadId, content: prompt, by: "human", model: selectedModel });
    } else {
      // it's a new chat then
      const id = crypto.randomUUID();
      createThread({ id });
      createMessage({ threadId: id, content: prompt, by: "human", model: selectedModel });
      navigate(`/chat/${id}`);
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <main className="relative h-screen grow overflow-hidden">
      <SidebarTrigger className="absolute top-2 left-2" />
      <div className="h-full overflow-auto pt-4 pb-48">
        <article className="mx-auto max-w-3xl space-y-5">
          {messages?.map((message) => <ChatBubble key={message._id} content={message.content} by={message.by} />)}
        </article>
      </div>
      <form className="absolute bottom-0 left-1/2 w-full max-w-3xl -translate-x-1/2 rounded-t-xl border bg-white/85 p-2 shadow backdrop-blur dark:bg-neutral-900/85">
        <Textarea
          id="prompt-input"
          ref={textareaRef}
          className="focus-visible:border-input resize-none rounded-md p-3 focus-visible:ring-0"
          placeholder="Ask anything..."
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (e.target instanceof HTMLTextAreaElement && e.target.value) {
                submitFormHandler(e.target.value);
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
              if (textarea instanceof HTMLTextAreaElement && textarea.value) {
                submitFormHandler(textarea.value);
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
      className={cn("prose dark:prose-invert max-w-none rounded-lg px-4 py-2", {
        "ml-auto w-fit bg-neutral-100 dark:bg-neutral-900": by === "human",
      })}
      dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
    />
  );
}

function AnimatingChatBubble() {
  return (
    <div className="flex h-11 w-fit items-center gap-1 px-4">
      <span className="size-2 animate-bounce rounded-full bg-neutral-300 dark:bg-neutral-900"></span>
      <span className="size-2 animate-bounce rounded-full bg-neutral-300 [animation-delay:300ms] [animation-fill-mode:both] dark:bg-neutral-900"></span>
      <span className="size-2 animate-bounce rounded-full bg-neutral-300 [animation-delay:600ms] [animation-fill-mode:both] dark:bg-neutral-900"></span>
    </div>
  );
}
