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
import type { Id } from "convex/_generated/dataModel";

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
        prevThreads.filter((thread) => thread._id !== args.id),
      );
    }
  });

  const [threadToDelete, setThreadToDelete] = useState<{ _id: Id<"threads">; threadId: string } | null>(null);
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
                <div
                  key={thread._id}
                  className={cn(
                    "hover:bg-sidebar-accent mx-2 hover:[&>div]:right-1 hover:[&>div]:bg-gradient-to-r  rounded-md relative group overflow-hidden",
                    { "bg-sidebar-accent": path?.split("/")[1] === thread.id },
                  )}
                >
                  <Link to={`/chat/${thread.id}`} key={thread._id} className="block py-2 px-2">
                    <span className="line-clamp-1">{thread.title}</span>
                  </Link>
                  <div className="absolute top-1/2 flex -translate-y-1/2 z-10 -right-10 from-transparent via-sidebar-accent to-sidebar-accent pointer-events-none transition-all">
                    <span className="inline-block w-8"></span>
                    <Button
                      className="size-7 pointer-events-auto"
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        setThreadToDelete({ _id: thread._id, threadId: thread.id });
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
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
                    deleteThread({ id: threadToDelete._id, threadId: threadToDelete.threadId });
                    // if the user is in the thread that's being deleted, re-route them to /
                    if (path?.split("/")[1] === threadToDelete.threadId) {
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
