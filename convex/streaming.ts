import { PersistentTextStreaming, type StreamId, StreamIdValidator } from "@convex-dev/persistent-text-streaming";
import { components } from "./_generated/api";
import { query } from "./_generated/server";

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming);

export const getStreamBody = query({
  args: { streamId: StreamIdValidator },
  async handler(ctx, args) {
    return await persistentTextStreaming.getStreamBody(ctx, args.streamId as StreamId);
  },
});
