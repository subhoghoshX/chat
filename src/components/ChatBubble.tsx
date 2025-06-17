import { cn, getUserId } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { DataModel } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, FileText, Split } from "lucide-react";
import MarkdownItAsync from "markdown-it-async";
import { useEffect, useState } from "react";
import { fromAsyncCodeToHtml } from "@shikijs/markdown-it/async";
import { codeToHtml } from "shiki";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useNavigate } from "react-router";

const md = MarkdownItAsync();

md.use(fromAsyncCodeToHtml(codeToHtml, { theme: "vitesse-dark" }));

export function MessageAuthenticated({ message }: { message: DataModel["messages"]["document"] }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (!message.content) return;
    async function renderMarkdown() {
      setHtml(await md.renderAsync(message.content));
    }
    renderMarkdown();
  }, [message.content]);

  const branchOff = useMutation(api.messages.branchOff);

  if (!message.content && message.by !== "human") {
    return <AnimatingChatBubble />;
  }

  return message.by === "human" ? (
    <div className="group ml-auto w-fit max-w-xl">
      {message.files.length > 0 && <FileBubble file={message.files[0]} />}
      <section
        className={cn("prose dark:prose-invert ml-auto rounded-xl bg-neutral-100 px-4 py-2 dark:bg-neutral-900", {
          "rounded-tr-md": message.files.length > 0,
        })}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className={cn("mt-1 flex justify-end opacity-0 transition group-hover:opacity-100")}>
        <CopyButton onClick={() => navigator.clipboard.writeText(message.content)} />
      </div>
    </div>
  ) : (
    <div className="group">
      <section
        className={cn("prose dark:prose-invert max-w-none rounded-xl px-4 dark:bg-neutral-950")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className={cn("mt-1 pl-4 opacity-0 transition group-hover:opacity-100")}>
        <CopyButton onClick={() => navigator.clipboard.writeText(message.content)} />
        <BranchButton onClick={() => branchOff({ threadId: message.threadId, messageId: message._id })} />
      </div>
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
    return <img src={fileUrl} className="mb-2 ml-auto h-23 w-40 overflow-hidden rounded-xl object-cover" />;
  else if (file.type === "application/pdf")
    return (
      <a
        href={fileUrl}
        target="_blank"
        className="mb-2 ml-auto flex w-fit items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-900"
      >
        <FileText className="size-4" /> {file.name}
      </a>
    );
}

export function MessageUnauthenticated({ message }: { message: DataModel["temporary_messages"]["document"] }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (!message.content) return;
    async function renderMarkdown() {
      setHtml(await md.renderAsync(message.content));
    }
    renderMarkdown();
  }, [message.content]);

  const branchOff = useMutation(api.temporary_messages.branchOff);

  if (!message.content && message.by !== "human") {
    return <AnimatingChatBubble />;
  }

  return message.by === "human" ? (
    <div className="group ml-auto w-fit max-w-xl">
      <section
        className={cn("prose dark:prose-invert ml-auto rounded-xl bg-neutral-100 px-4 py-2 dark:bg-neutral-900")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className={cn("mt-1 flex justify-end opacity-0 transition group-hover:opacity-100")}>
        <CopyButton onClick={() => navigator.clipboard.writeText(message.content)} />
      </div>
    </div>
  ) : (
    <div className="group">
      <section
        className={cn("prose dark:prose-invert max-w-none rounded-xl px-4 dark:bg-neutral-950")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className={cn("mt-1 pl-4 opacity-0 transition group-hover:opacity-100")}>
        <CopyButton onClick={() => navigator.clipboard.writeText(message.content)} />
        <BranchButton
          onClick={() => branchOff({ threadId: message.threadId, messageId: message._id, userId: getUserId() })}
        />
      </div>
    </div>
  );
}

function CopyButton({ onClick }: { onClick: () => Promise<void> }) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={async () => {
            await onClick();
            setIsCopied(true);
            const id = setTimeout(() => {
              setIsCopied(false);
              clearTimeout(id);
            }, 1000);
          }}
        >
          {!isCopied ? <Copy /> : <Check />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy message</TooltipContent>
    </Tooltip>
  );
}

function BranchButton({ onClick }: { onClick: () => Promise<string> }) {
  const navigate = useNavigate();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={async () => {
            const newThreadId = await onClick();
            navigate(`/chat/${newThreadId}`);
          }}
        >
          <Split className="rotate-180" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Branch off</TooltipContent>
    </Tooltip>
  );
}

function ImageFileSkeleton() {
  return <div className="mb-2 ml-auto h-23 w-40 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900"></div>;
}

function PdfFileSkeleton() {
  return <div className="mb-2 ml-auto h-9 w-32 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900"></div>;
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
