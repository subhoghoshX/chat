import { Bird, MessageCircle, X } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link, useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import type { DataModel } from "convex/_generated/dataModel";
import { Input } from "./ui/input";

type Thread = DataModel["threads"]["document"];

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
  const threads = useQuery(api.threads.getThreads);
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

  const deleteThread = useMutation(api.threads.deleteThread).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.threads.getThreads);

    if (prevThreads !== undefined) {
      localStore.setQuery(
        api.threads.getThreads,
        {},
        prevThreads.filter((thread) => thread._id !== args._id),
      );
    }
  });

  const [threadToDelete, setThreadToDelete] = useState<Thread | null>(null);
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
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={`https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyfGVufDB8fDB8fHww`}
              alt="Guest User"
            />
            <AvatarFallback className="rounded-lg">A</AvatarFallback>
          </Avatar>
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
                    setThreadToDelete(_thread);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {threadToDelete && (
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
                    deleteThread({ _id: threadToDelete._id, threadId: threadToDelete.id });
                    // if the user is in the thread that's being deleted, re-route them to /
                    if (path?.split("/")[1] === threadToDelete.id) {
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
  thread: Thread;
  onDeleteBtnClick: (thread: Thread) => void;
}

function Thread({ thread, onDeleteBtnClick }: ThreadProps) {
  const [isThreadTitleEditing, setIsThreadTitleEditing] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState<string | null>(null);

  const { "*": path } = useParams();

  const updateThreadTitle = useMutation(api.threads.updateThread).withOptimisticUpdate((localStore, args) => {
    const prevThreads = localStore.getQuery(api.threads.getThreads);

    if (prevThreads !== undefined) {
      const newThreads = prevThreads.map((thread) =>
        thread._id === args._id ? { ...thread, title: args.title } : thread,
      );
      localStore.setQuery(api.threads.getThreads, {}, newThreads);
    }
  });

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
