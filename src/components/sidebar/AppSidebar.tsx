import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Unauthenticated, useConvexAuth } from "convex/react";
import { Link } from "react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SignInButton } from "@clerk/clerk-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FirstSidebar from "./FirstSidebar";
import ThreadsAuthenticated from "./ThreadsAuthenticated";
import ThreadsUnauthenticated from "./ThreadsUnauthenticated";
import { useState } from "react";

export default function AppSidebar() {
  const auth = useConvexAuth();

  const [text, setText] = useState("");

  return (
    <Sidebar collapsible="icon" className="overflow-hidden *:data-[sidebar=sidebar]:flex-row">
      <FirstSidebar />

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
          <SidebarInput placeholder="Search threads..." value={text} onChange={(e) => setText(e.target.value)} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent className="space-y-2">
              {auth.isAuthenticated ? <ThreadsAuthenticated text={text} /> : <ThreadsUnauthenticated text={text} />}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <Unauthenticated>
          <SidebarFooter>
            <Alert>
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription className="block">
                For backing up your chat and access to more models,{" "}
                <SignInButton>
                  <a className="cursor-pointer font-semibold text-blue-500 underline">please log in</a>
                </SignInButton>
                .
              </AlertDescription>
            </Alert>
          </SidebarFooter>
        </Unauthenticated>
      </Sidebar>
    </Sidebar>
  );
}
