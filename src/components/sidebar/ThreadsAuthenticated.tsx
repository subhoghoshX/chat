import { useDeleteThread, useUpdateThreadTitle, type Thread } from "@/lib/thread";
import { cn, getUserId } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import DeleteThreadConfirmDialog from "./DeleteThreadConfirmDialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Share, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import ShareThreadConfirmDialog from "./ShareThreadConfirmDialog";

export default function ThreadsAuthenticated() {
  let threads = useQuery(api.threads.getThreads);
  if (!threads) {
    const str = localStorage.getItem("threads");
    threads = str ? JSON.parse(str) : undefined;
  } else {
    localStorage.setItem("threads", JSON.stringify(threads));
  }

  const { "*": path } = useParams();

  const deleteThread = useDeleteThread();

  const [threadToDelete, setThreadToDelete] = useState<Thread | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();

  const promote = useMutation(api.promote.promote);

  useEffect(() => {
    // in case the user had any chats in un-authenticated state
    // move them to the permanent tables
    const userId = getUserId();
    if (userId) {
      promote({ userId });
    }
  }, [navigate, promote]);

  const [threadToShare, setThreadToShare] = useState<Thread | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const shareThread = useMutation(api.threads.share);

  return (
    <>
      {threads?.map((thread) => (
        <Thread
          key={thread._id}
          thread={thread}
          onDeleteBtnClick={(_thread) => {
            setThreadToDelete(_thread);
            setIsDeleteDialogOpen(true);
          }}
          onShareBtnClick={(_thread) => {
            setThreadToShare(_thread);
            setIsShareDialogOpen(true);
          }}
        />
      ))}
      {threadToDelete && (
        <DeleteThreadConfirmDialog
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          onDeleteBtnClick={() => {
            deleteThread({ _id: threadToDelete._id, threadId: threadToDelete.id });
            // if the user is in the thread that's being deleted, re-route them to /
            if (path?.split("/")[1] === threadToDelete.id) {
              navigate("/");
            }
          }}
        />
      )}
      {threadToShare && (
        <ShareThreadConfirmDialog
          isOpen={isShareDialogOpen}
          setIsOpen={setIsShareDialogOpen}
          onGenerateBtnClick={() => shareThread({ _id: threadToShare._id })}
        />
      )}
    </>
  );
}

interface ThreadProps {
  thread: Thread;
  onDeleteBtnClick: (thread: Thread) => void;
  onShareBtnClick: (thread: Thread) => void;
}

function Thread({ thread, onDeleteBtnClick, onShareBtnClick }: ThreadProps) {
  const [isThreadTitleEditing, setIsThreadTitleEditing] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState<string | null>(null);

  const { "*": path } = useParams();

  const updateThreadTitle = useUpdateThreadTitle();

  return (
    <div
      key={thread._id}
      className={cn(
        "hover:bg-sidebar-accent group relative mx-2 overflow-hidden rounded-md hover:[&_#thread-gradient]:bg-gradient-to-r hover:[&>div]:right-1",
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
                updateThreadTitle({ _id: thread._id, title: newThreadTitle });
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
              updateThreadTitle({ _id: thread._id, title: newThreadTitle });
            }
            setIsThreadTitleEditing(false);
          }}
        />
      )}
      <div className="pointer-events-none absolute top-1/2 -right-15 z-10 flex -translate-y-1/2 transition-all">
        <span
          id="thread-gradient"
          className="via-sidebar-accent/90 to-sidebar-accent inline-block w-8 from-transparent"
        ></span>
        <div className="bg-sidebar-accent flex gap-1">
          <Button
            className="pointer-events-auto size-7"
            size="icon"
            variant="outline"
            onClick={() => onShareBtnClick(thread)}
          >
            <Share />
          </Button>
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
    </div>
  );
}
