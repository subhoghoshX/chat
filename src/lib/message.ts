import { api } from "../../convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

export function useMessages(threadId: string | undefined) {
  const auth = useConvexAuth();
  const userId = localStorage.getItem("userId");

  const messages = useQuery(api.messages.getMessages, auth.isAuthenticated && threadId ? { threadId } : "skip");
  const temporaryMessages = useQuery(
    api.temporary_messages.get,
    !auth.isAuthenticated && userId && threadId ? { userId: userId, threadId } : "skip",
  );

  return auth.isAuthenticated ? messages : temporaryMessages;
}

export function useCreateMessage() {
  return useMutation(api.messages.createMessage).withOptimisticUpdate((localStore, args) => {
    const prevMessages = localStore.getQuery(api.messages.getMessages, { threadId: args.threadId });

    if (prevMessages !== undefined) {
      localStore.setQuery(api.messages.getMessages, { threadId: args.threadId }, [
        ...prevMessages,
        { _id: crypto.randomUUID() as Id<"messages">, _creationTime: Date.now(), userId: "user_temporary", ...args },
      ]);
    }
  });
}

export function useCreateTemporaryMessage() {
  return useMutation(api.temporary_messages.create).withOptimisticUpdate((localStore, args) => {
    const prevMessages = localStore.getQuery(api.temporary_messages.get, {
      threadId: args.threadId,
      userId: args.userId,
    });

    if (prevMessages !== undefined) {
      localStore.setQuery(api.temporary_messages.get, { threadId: args.threadId, userId: args.userId }, [
        ...prevMessages,
        { _id: crypto.randomUUID() as Id<"temporary_messages">, _creationTime: Date.now(), ...args },
      ]);
    }
  });
}
