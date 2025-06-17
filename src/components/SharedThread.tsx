import type { Id } from "convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { Authenticated, AuthLoading, Unauthenticated, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { MessageAuthenticated, MessageUnauthenticated } from "./ChatBubble";
import { SignInButton } from "@clerk/clerk-react";
import { LoaderCircle } from "lucide-react";

export default function SharedThread() {
  return (
    <>
      <AuthLoading>
        <main className="flex grow flex-col items-center justify-center gap-1">
          <LoaderCircle className="animate-spin" />
          Fetching thread...
        </main>
      </AuthLoading>
      <Authenticated>
        <AuthenticateUser />
      </Authenticated>
      <Unauthenticated>
        <main className="flex grow flex-col items-center justify-center gap-2">
          You must be logged in to use this feature.
          <SignInButton>
            <Button>Log In</Button>
          </SignInButton>
        </main>
        <main className=""></main>
      </Unauthenticated>
    </>
  );
}

function AuthenticateUser() {
  const { _threadId } = useParams();

  const cloneToCurrentUser = useMutation(api.threads.cloneToCurrentUser);

  const navigate = useNavigate();

  const sharedThreadMessages = useQuery(
    api.messages.getSharedThreadMessages,
    _threadId ? { _id: _threadId as Id<"threads"> } : "skip",
  );

  return (
    <main className="relative h-screen grow overflow-hidden">
      <SidebarTrigger className="absolute top-2 left-2" />
      <div className="h-full overflow-auto pt-4 pb-48">
        <article className="mx-auto max-w-3xl space-y-5">
          {sharedThreadMessages?.map((message) => <MessageAuthenticated key={message._id} message={message} />)}
        </article>
        <div
          className="mt-10 flex justify-center"
          onClick={async () => {
            if (!_threadId) {
              console.error("Thread id is not present.");
              return;
            }

            const clonedThreadId = await cloneToCurrentUser({ _id: _threadId as Id<"threads"> });
            navigate(`/chat/${clonedThreadId}`);
          }}
        >
          <Button className="mx-auto" variant="outline">
            Clone thread to your account to send message
          </Button>
        </div>
      </div>
    </main>
  );
}
