import { Link, useParams } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { Bird, LogIn, MessageCircle, Settings } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { useState } from "react";

const navMain = [
  {
    title: "Chats",
    url: "#",
    icon: MessageCircle,
    isActive: true,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    isActive: false,
  },
];

export default function FirstSidebar() {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = useState(navMain[0]);

  const { setOpen } = useSidebar();

  const router = useParams()

  return (
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
  );
}
