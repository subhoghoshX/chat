import { api } from "../../convex/_generated/api";
import type { DataModel, Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";

export type Thread = DataModel["threads"]["document"];

export function useCreateThread() {
  return useMutation(api.threads.createThread).withOptimisticUpdate((localStore, args) => {
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
          userId: "user_temporary",
        },
      ]);
    }
  });
}

export function useDeleteThread() {
  return useMutation(api.threads.deleteThread).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.threads.getThreads);

    if (prevThreads !== undefined) {
      localStore.setQuery(
        api.threads.getThreads,
        {},
        prevThreads.filter((thread) => thread._id !== args._id),
      );
    }
  });
}

export function useUpdateThreadTitle() {
  return useMutation(api.threads.updateThread).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.threads.getThreads);

    if (prevThreads !== undefined) {
      const newThreads = prevThreads.map((thread) =>
        thread._id === args._id ? { ...thread, title: args.title } : thread,
      );
      localStore.setQuery(api.threads.getThreads, {}, newThreads);
    }
  });
}

export type TemporaryThread = DataModel["temporary_threads"]["document"];

export function useCreateTemporaryThread() {
  return useMutation(api.temporary_threads.create).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.temporary_threads.get, { userId: args.userId });

    if (prevThreads !== undefined) {
      localStore.setQuery(api.temporary_threads.get, { userId: args.userId }, [
        ...prevThreads,
        {
          _id: crypto.randomUUID() as Id<"temporary_threads">,
          _creationTime: Date.now(),
          ...args,
          title: "New Thread",
          isPublic: false,
          userId: "user_temporary",
        },
      ]);
    }
  });
}

export function useDeleteTemporaryThread() {
  return useMutation(api.temporary_threads.deleteThread).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.temporary_threads.get, { userId: args.userId });

    if (prevThreads !== undefined) {
      localStore.setQuery(
        api.temporary_threads.get,
        { userId: args.userId },
        prevThreads.filter((thread) => thread._id !== args._id),
      );
    }
  });
}

export function useUpdateTemporaryThreadTitle() {
  return useMutation(api.temporary_threads.update).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.temporary_threads.get, { userId: args.userId });

    if (prevThreads !== undefined) {
      const newThreads = prevThreads.map((thread) =>
        thread._id === args._id ? { ...thread, title: args.title } : thread,
      );
      localStore.setQuery(api.temporary_threads.get, { userId: args.userId }, newThreads);
    }
  });
}
