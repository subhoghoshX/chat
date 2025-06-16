import { useParams } from "react-router";
import { SidebarTrigger } from "./ui/sidebar";
import { getUserId } from "@/lib/utils";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageAuthenticated, MessageUnauthenticated } from "./ChatBubble";
import ChatInput from "./ChatInput";

export default function ChatArea() {
  const { threadId } = useParams();

  const auth = useConvexAuth();

  const messages = useQuery(api.messages.getMessages, auth.isAuthenticated && threadId ? { threadId } : "skip");
  const temporaryMessages = useQuery(
    api.temporary_messages.get,
    !auth.isAuthenticated && threadId ? { userId: getUserId(), threadId } : "skip",
  );

  return (
    <main className="relative h-screen grow overflow-hidden">
      <SidebarTrigger className="absolute top-2 left-2" />
      <div className="h-full overflow-auto pt-4 pb-48">
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
