import { Bird, LogIn, MessageCircle, X } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { Link, useNavigate, useParams } from "react-router";
import { cn, getUserId } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDeleteTemporaryThread, useUpdateTemporaryThreadTitle, type TemporaryThread } from "@/lib/thread";
import { api } from "../../../convex/_generated/api";

const navMain = [
  {
    title: "Chats",
    url: "#",
    icon: MessageCircle,
    isActive: true,
  },
];

export default function AppSidebar() {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = useState(navMain[0]);

  const userId = getUserId();
  let threads = useQuery(api.temporary_threads.get, userId ? { userId: userId } : "skip");
  if (!threads) {
    const str = localStorage.getItem("threads");
    threads = str ? JSON.parse(str) : undefined;
  } else {
    localStorage.setItem("threads", JSON.stringify(threads));
  }

  const { setOpen } = useSidebar();

  const { "*": path } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    function handleCreateNewChat(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "O") {
        e.preventDefault();
        navigate("/");
      }
    }
    window.addEventListener("keydown", handleCreateNewChat);

    return () => {
      window.removeEventListener("keydown", handleCreateNewChat);
    };
  }, [navigate]);

  const deleteTemporaryThread = useDeleteTemporaryThread();

  const [temporaryThreadToDelete, setTemporaryThreadToDelete] = useState<TemporaryThread | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row">
      <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link to="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Bird className="size-4" />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        setOpen(true);
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-4">
          <ThemeToggle />
          <AuthLoading>
            <span className="bg-sidebar-border inline-block size-8 animate-pulse rounded-lg"></span>
          </AuthLoading>
          <Unauthenticated>
            <SignInButton>
              <Button size="icon" variant="outline" className="size-8 cursor-pointer">
                <LogIn className="size-4" />
              </Button>
            </SignInButton>
          </Unauthenticated>
          <Authenticated>
            <div className="flex size-8 [&_.cl-avatarBox]:size-8! [&_.cl-avatarBox]:rounded-lg!">
              <UserButton />
            </div>
          </Authenticated>
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/">
                <Button className="w-full">New Chat</Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Ctrl/Cmd + Shift + O</TooltipContent>
          </Tooltip>
          <SidebarInput placeholder="Search threads..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent className="space-y-2">
              {threads?.map((thread) => (
                <Thread
                  key={thread._id}
                  thread={thread}
                  onDeleteBtnClick={(_thread) => {
                    setTemporaryThreadToDelete(_thread);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <Unauthenticated>
          <SidebarFooter>
            <Alert>
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>For backing up your chat and access to more models. Login in.</AlertDescription>
            </Alert>
          </SidebarFooter>
        </Unauthenticated>
        {temporaryThreadToDelete && (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the thread.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 dark:bg-red-400"
                  onClick={() => {
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
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Sidebar>
    </Sidebar>
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
