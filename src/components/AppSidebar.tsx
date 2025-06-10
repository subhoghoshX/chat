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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Chats",
      url: "#",
      icon: MessageCircle,
      isActive: true,
    },
  ],
  threads: [
    {
      id: "44ada268-a127-4f69-8ab2-d4f762dedd6b",
      title: "Solve advent of code 2021",
    },
    {
      id: "44ada268-a127-4f69-8ab2-d4f762dedd6c",
      title: "Greeting",
    },
    {
      id: "44ada268-a127-4f69-8ab2-d4f762dedd6d",
      title: "Meaning of life",
    },
  ],
};

export default function AppSidebar() {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const [threads, setThreads] = useState(data.threads);
  const { setOpen } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row">
      <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                {/* TODO: use client side routing, it reloads the page otherwise */}
                <a href="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Bird className="size-4" />
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        const thread = data.threads.sort(() => Math.random() - 0.5);
                        setThreads(thread.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1)));
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
          <Button>New Chat</Button>
          <SidebarInput placeholder="Search threads..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {threads.map((thread) => (
                <a
                  href="#"
                  key={thread.id}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                >
                  <span className="line-clamp-1 w-[260px] whitespace-break-spaces">{thread.title}</span>
                </a>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
