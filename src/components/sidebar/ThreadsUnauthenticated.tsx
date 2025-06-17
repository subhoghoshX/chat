import { cn, getUserId } from "@/lib/utils";
import DeleteThreadConfirmDialog from "./DeleteThreadConfirmDialog";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link, useNavigate, useParams } from "react-router";
import { useDeleteTemporaryThread, useUpdateTemporaryThreadTitle, type TemporaryThread } from "@/lib/thread";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface Props {
  text: string;
}

export default function ThreadsUnauthenticated({ text }: Props) {
  const userId = getUserId();
  let threads = useQuery(api.temporary_threads.get, userId ? { userId: userId } : "skip");
  if (!threads) {
    const str = localStorage.getItem("threads");
    threads = str ? JSON.parse(str) : undefined;
  } else {
    localStorage.setItem("threads", JSON.stringify(threads));
  }

  const filteredThreads = threads?.filter((thread) => thread.title.toLowerCase().includes(text.toLowerCase()));

  const { "*": path } = useParams();

  const navigate = useNavigate();

  const deleteTemporaryThread = useDeleteTemporaryThread();

  const [temporaryThreadToDelete, setTemporaryThreadToDelete] = useState<TemporaryThread | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      {filteredThreads?.map((thread) => (
        <Thread
          key={thread._id}
          thread={thread}
          onDeleteBtnClick={(_thread) => {
            setTemporaryThreadToDelete(_thread);
            setIsDeleteDialogOpen(true);
          }}
        />
      ))}
      {temporaryThreadToDelete && (
        <DeleteThreadConfirmDialog
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          onDeleteBtnClick={() => {
            deleteTemporaryThread({
              _id: temporaryThreadToDelete._id,
              threadId: temporaryThreadToDelete.id,
              userId: getUserId(),
            });
            // if the user is in the thread that's being deleted, re-route them to /
            if (path?.split("/")[1] === temporaryThreadToDelete.id) {
              navigate("/");
            }
          }}
        />
      )}
    </>
  );
}

interface ThreadProps {
  thread: TemporaryThread;
  onDeleteBtnClick: (thread: TemporaryThread) => void;
}

function Thread({ thread, onDeleteBtnClick }: ThreadProps) {
  const [isThreadTitleEditing, setIsThreadTitleEditing] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState<string | null>(null);

  const { "*": path } = useParams();

  const updateTemporaryThreadTitle = useUpdateTemporaryThreadTitle();

  const userId = getUserId();

  return (
    <div
      key={thread._id}
      className={cn(
        "hover:bg-sidebar-accent group relative mx-2 overflow-hidden rounded-md hover:[&>div]:right-1 hover:[&>div]:bg-gradient-to-r",
        { "bg-sidebar-accent": path?.split("/")[1] === thread.id },
      )}
    >
      {!isThreadTitleEditing ? (
        <Link
          to={`/chat/${thread.id}`}
          key={thread._id}
          className="block px-2 py-2"
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsThreadTitleEditing(true);
          }}
        >
          <span className="line-clamp-1">{thread.title}</span>
        </Link>
      ) : (
        <Input
          ref={(elem) => elem?.focus()}
          value={newThreadTitle ?? thread.title}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (newThreadTitle?.trim()) {
                updateTemporaryThreadTitle({ _id: thread._id, title: newThreadTitle, userId });
              }
              setIsThreadTitleEditing(false);
            }
            if (e.key === "Escape") {
              setNewThreadTitle(thread.title);
              setIsThreadTitleEditing(false);
            }
          }}
          onBlur={() => {
            if (newThreadTitle) {
              updateTemporaryThreadTitle({ _id: thread._id, title: newThreadTitle, userId });
            }
            setIsThreadTitleEditing(false);
          }}
        />
      )}
      <div className="via-sidebar-accent to-sidebar-accent pointer-events-none absolute top-1/2 -right-10 z-10 flex -translate-y-1/2 from-transparent transition-all">
        <span className="inline-block w-8"></span>
        <Button
          className="pointer-events-auto size-7"
          size="icon"
          variant="destructive"
          onClick={() => onDeleteBtnClick(thread)}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
