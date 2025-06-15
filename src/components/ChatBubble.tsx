import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { DataModel } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { marked } from "marked";
import { Paperclip } from "lucide-react";

export function ChatBubbleForAuthenticatedUser({ message }: { message: DataModel["messages"]["document"] }) {
  if (!message.content && message.by !== "human") {
    return <AnimatingChatBubble />;
  }
  return (
    <div>
      {message.files.length > 0 && <FileBubble file={message.files[0]} />}
      <section
        className={cn("prose dark:prose-invert max-w-none rounded-xl px-4 py-2", {
          "ml-auto w-fit bg-neutral-100 dark:bg-neutral-900": message.by === "human",
          "rounded-tr-md": message.files.length > 0,
        })}
        dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }}
      />
    </div>
  );
}

function FileBubble({ file }: { file: DataModel["messages"]["document"]["files"][number] }) {
  const fileUrl = useQuery(api.messages.getFileUrl, { storageId: file.storageId });
  if (!fileUrl) {
    if (file.type.startsWith("image/")) return <ImageFileSkeleton />;
    if (file.type === "application/pdf") return <PdfFileSkeleton />;
    return;
  }

  if (file.type.startsWith("image/"))
    return <img src={fileUrl} className="mb-2 ml-auto h-23 w-40 overflow-hidden rounded-xl" />;
  else if (file.type === "application/pdf")
    return (
      <a
        href={fileUrl}
        target="_blank"
        className="mb-2 ml-auto flex w-fit items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-900"
      >
        <Paperclip className="size-4" /> Attachment
      </a>
    );
}

function ImageFileSkeleton() {
  return <div className="mb-2 ml-auto h-23 w-40 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900"></div>;
}

function PdfFileSkeleton() {
  return <div className="mb-2 ml-auto h-9 w-32 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900"></div>;
}

interface ChatBubbleForUnauthenticatedUserProps {
  message: DataModel["temporary_messages"]["document"];
}

export function ChatBubbleForUnauthenticatedUser({ message }: ChatBubbleForUnauthenticatedUserProps) {
  if (!message.content && message.by !== "human") {
    return <AnimatingChatBubble />;
  }
  return (
    <section
      className={cn("prose dark:prose-invert max-w-none rounded-xl px-4 py-2", {
        "ml-auto w-fit bg-neutral-100 dark:bg-neutral-900": message.by === "human",
      })}
      dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }}
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
