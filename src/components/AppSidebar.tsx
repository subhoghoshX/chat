import { Bird, MessageCircle } from "lucide-react";
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
import { useState } from "react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link, useParams } from "react-router";
import type { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

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
  const createThread = useMutation(api.threads.createThread).withOptimisticUpdate((localStore, args) => {
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
        },
      ]);
    }
  });
  const { setOpen } = useSidebar();

  const { "*": path } = useParams();

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
          <Button onClick={() => createThread({ id: crypto.randomUUID() })}>New Chat</Button>
          <SidebarInput placeholder="Search threads..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {threads?.map((thread) => (
                <Link
                  to={`/chat/${thread.id}`}
                  key={thread._id}
                  className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0",
                    { "bg-sidebar-accent": path?.split("/")[1] === thread.id },
                  )}
                >
                  <span className="line-clamp-1 w-[260px] whitespace-break-spaces">{thread.title}</span>
                </Link>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
