import { Link, useNavigate, useParams } from "react-router";
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
import { Bird, LogIn, LogOut, MessageCircle, Settings } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button } from "../ui/button";
import AuthDialog from "../AuthDialog";
import { useAuthActions } from "@convex-dev/auth/react";

const navMain = [
  {
    title: "Chats",
    url: "/",
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
  const { setOpen } = useSidebar();
  const { signOut } = useAuthActions();

  const { "*": path } = useParams();

  const navigate = useNavigate();

  return (
    <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" nativeButton={false} render={<Link to="/" />} className="md:h-8 md:p-0">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Bird className="size-4" />
              </div>
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
                    aria-label={item.title}
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    onClick={() => {
                      navigate(item.url);
                      setOpen(true);
                    }}
                    isActive={item.url === "/settings" ? path === "settings" : path !== "settings"}
                    className="px-2.5 md:px-2"
                  >
                    <item.icon />
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
          <AuthDialog
            trigger={
              <Button size="icon" variant="outline" className="size-8 cursor-pointer">
                <LogIn className="size-4" />
              </Button>
            }
          />
        </Unauthenticated>
        <Authenticated>
          <Button size="icon" variant="outline" className="size-8 cursor-pointer" onClick={() => void signOut()}>
            <LogOut className="size-4" />
          </Button>
        </Authenticated>
      </SidebarFooter>
    </Sidebar>
  );
}
