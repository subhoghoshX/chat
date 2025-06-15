import { useNavigate, useParams } from "react-router";
import ModelSelector from "./ModelSelector";
import { SidebarTrigger } from "./ui/sidebar";
import { Textarea } from "./ui/textarea";
import { getUserId } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { Model } from "../../utils/supported-models";
import { Button } from "./ui/button";
import { ArrowUp, Plus, Image } from "lucide-react";
import { useCreateMessage, useCreateTemporaryMessage } from "@/lib/message";
import { useCreateTemporaryThread, useCreateThread } from "@/lib/thread";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ChatBubbleForAuthenticatedUser, ChatBubbleForUnauthenticatedUser } from "./ChatBubble";

export default function ChatArea() {
  const { threadId } = useParams();

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId]);

  const auth = useConvexAuth();

  const messages = useQuery(api.messages.getMessages, auth.isAuthenticated && threadId ? { threadId } : "skip");
  const temporaryMessages = useQuery(
    api.temporary_messages.get,
    !auth.isAuthenticated && threadId ? { userId: getUserId(), threadId } : "skip",
  );

  const createMessage = useCreateMessage();
  const createTemporaryMessage = useCreateTemporaryMessage();

  const createThread = useCreateThread();
  const createTemporaryThread = useCreateTemporaryThread();

  const [selectedModel, setSelectedModel] = useState<Model>("vertex/gemini-2.0-flash-001");

  const navigate = useNavigate();

  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  async function storeImage(file: File) {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: selectedFile,
    });

    const { storageId } = await result.json();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    return storageId as Id<"_storage">;
  }

  async function submitFormHandler(prompt: string) {
    if (threadId) {
      if (auth.isAuthenticated) {
        const storageId = selectedFile ? await storeImage(selectedFile) : null;
        createMessage({
          threadId,
          content: prompt,
          by: "human",
          model: selectedModel,
          files: storageId && selectedFile ? [{ storageId, type: selectedFile.type }] : [],
        });
      } else {
        const userId = getUserId();
        createTemporaryMessage({ threadId, content: prompt, by: "human", model: selectedModel, userId });
      }
    } else {
      // it's a new chat then
      const id = crypto.randomUUID();
      if (auth.isAuthenticated) {
        createThread({ id });
        const storageId = selectedFile ? await storeImage(selectedFile) : null;
        createMessage({
          threadId: id,
          content: prompt,
          by: "human",
          model: selectedModel,
          files: storageId && selectedFile ? [{ storageId, type: selectedFile.type }] : [],
        });
      } else {
        const userId = getUserId();
        createTemporaryThread({ id, userId });
        createTemporaryMessage({ threadId: id, content: prompt, by: "human", model: selectedModel, userId });
      }
      navigate(`/chat/${id}`);
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="relative h-screen grow overflow-hidden">
      <SidebarTrigger className="absolute top-2 left-2" />
      <div className="h-full overflow-auto pt-4 pb-48">
        <article className="mx-auto max-w-3xl space-y-5">
          {auth.isAuthenticated
            ? messages?.map((message) => <ChatBubbleForAuthenticatedUser key={message._id} message={message} />)
            : temporaryMessages?.map((message) => (
                <ChatBubbleForUnauthenticatedUser key={message._id} message={message} />
              ))}
        </article>
      </div>
      <form className="absolute bottom-0 left-1/2 w-full max-w-3xl -translate-x-1/2 rounded-t-xl border bg-white/85 p-2 shadow backdrop-blur dark:bg-neutral-900/85">
        <Textarea
          id="prompt-input"
          ref={textareaRef}
          className="focus-visible:border-input max-h-[70vh] resize-none rounded-md p-3 focus-visible:ring-0"
          placeholder="Ask anything..."
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (e.target instanceof HTMLTextAreaElement && e.target.value.trim()) {
                submitFormHandler(e.target.value);
                e.target.value = "";
              }
            }
          }}
        />
        <div className="mt-2 flex gap-1">
          <ModelSelector selectedModel={selectedModel} onChange={(model) => setSelectedModel(model)} />
          <Button variant="ghost" size="sm" type="button" className="relative">
            <input
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 opacity-0"
              accept="image/*, application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            {!selectedFile ? (
              <>
                <Plus /> Add files
              </>
            ) : (
              <>
                <Image /> {selectedFile.name}
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="ml-auto"
            type="button"
            onClick={() => {
              const textarea = document.getElementById("prompt-input");
              if (textarea instanceof HTMLTextAreaElement && textarea.value.trim()) {
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
