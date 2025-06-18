import { useParams } from "react-router";
import { SidebarTrigger } from "./ui/sidebar";
import { getUserId } from "@/lib/utils";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageAuthenticated, MessageUnauthenticated } from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useEffect, useRef } from "react";

export default function ChatArea() {
  const { threadId } = useParams();

  const auth = useConvexAuth();

  const { "*": path } = useParams();

  const messages = useQuery(api.messages.getMessages, auth.isAuthenticated && threadId ? { threadId } : "skip");
  const temporaryMessages = useQuery(
    api.temporary_messages.get,
    !auth.isAuthenticated && threadId ? { userId: getUserId(), threadId } : "skip",
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, temporaryMessages]);

  return (
    <main className="relative h-screen grow overflow-hidden">
      <SidebarTrigger className="absolute top-2 left-2" />
      {path === "" && <WelcomeQuestions />}
      <div ref={scrollContainerRef} className="h-full overflow-auto pt-4 pb-48">
        <article className="mx-auto max-w-3xl space-y-5">
          {auth.isAuthenticated
            ? messages?.map((message) => <MessageAuthenticated key={message._id} message={message} />)
            : temporaryMessages?.map((message) => <MessageUnauthenticated key={message._id} message={message} />)}
        </article>
      </div>
      <ChatInput />
    </main>
  );
}

const exampleQuestions = [
  "What's a fun fact that sounds unbelievable but is true?",
  "Can you tell me a joke that always makes people laugh?",
  "Can you help me come up with a creative story idea?",
  "How do I increase my pay at work?",
  'How many Rs are in the word "strawberry"?',
];

function WelcomeQuestions() {
  function insertQuestion(question: string) {
    const promptInput = document.getElementById("prompt-input");
    if (promptInput && promptInput instanceof HTMLTextAreaElement) {
      promptInput.value = question + " ";
      promptInput.focus();
    }
  }
  return (
    <section className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-4/5">
      <h1 className="px-4 text-3xl font-bold text-[var(--primary)]">How can I help you?</h1>
      <ul className="text-muted-foreground mt-6 *:cursor-pointer *:rounded-md *:px-4 *:py-2 *:transition *:hover:bg-neutral-100 *:dark:hover:bg-neutral-900">
        {exampleQuestions.map((q) => (
          <li key={q} onClick={() => insertQuestion(q)}>
            {q}
          </li>
        ))}
      </ul>
    </section>
  );
}
