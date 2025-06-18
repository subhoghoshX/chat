import { SignInButton, useUser } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Bug, FileText, ImageIcon, Lightbulb, LoaderCircle } from "lucide-react";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { applyColorScheme } from "@/lib/colorscheme";
import { api } from "../../convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import InlineLink from "./InlineLink";
import { Switch } from "./ui/switch";
import { useState, useEffect } from "react";
import { Label } from "./ui/label";

export default function Settings() {
  const { user } = useUser();
  const [hideEmail, setHideEmail] = useState(() => {
    return localStorage.getItem("hideEmail") === "true";
  });

  useEffect(() => {
    localStorage.setItem("hideEmail", hideEmail.toString());
  }, [hideEmail]);

  return (
    <>
      <AuthLoading>
        <main className="flex w-full items-center justify-center gap-2">
          <LoaderCircle className="animate-spin" />
        </main>
      </AuthLoading>
      <Unauthenticated>
        <main className="flex w-full flex-col items-center justify-center gap-2">
          <h1>Settings is only for logged in users.</h1>
          <SignInButton>
            <Button className="cursor-pointer">Login now</Button>
          </SignInButton>
        </main>
      </Unauthenticated>
      <Authenticated>
        <main className="flex w-full justify-center gap-10 px-8 pt-20">
          <section className="flex flex-col">
            <Avatar className="size-32 rounded-[20px]">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="size-32 rounded-[20px]">{user?.firstName}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="mt-3 text-xl font-medium">{user?.fullName}</h2>
              <p className={`text-sm text-neutral-500 ${hideEmail ? "blur-sm" : ""}`}>
                {user?.emailAddresses?.[0].emailAddress}
              </p>
              <Progress value={3} className="mt-3" />
              <Badge className="mt-3" variant="secondary">
                Free Tier
              </Badge>
            </div>
            <Alert className="mt-4">
              <AlertTitle>Keyboard Shortcuts</AlertTitle>
              <AlertDescription className="mt-6 flex flex-col gap-3">
                <p className="flex w-full justify-between">
                  New Chat
                  <kbd className="ml-10 space-x-1">
                    <Badge variant="secondary">Ctrl</Badge>
                    <Badge variant="secondary">Shift</Badge>
                    <Badge variant="secondary">O</Badge>
                  </kbd>
                </p>
                <p className="flex w-full justify-between">
                  Toggle Sidebar
                  <kbd className="space-x-1">
                    <Badge variant="secondary">Ctrl</Badge>
                    <Badge variant="secondary">B</Badge>
                  </kbd>
                </p>
              </AlertDescription>
            </Alert>
          </section>
          <Tabs defaultValue="appearance" className="w-full max-w-140">
            <TabsList className="*:px-5">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            <TabsContent value="appearance">
              <h3>Change colorscheme:</h3>
              <div className="mt-2 flex gap-2">
                <Button
                  size="icon"
                  onClick={() => applyColorScheme("neutral")}
                  className="bg-neutral-500 hover:bg-neutral-600"
                />
                <Button size="icon" onClick={() => applyColorScheme("red")} className="bg-red-500 hover:bg-red-600" />
                <Button
                  size="icon"
                  onClick={() => applyColorScheme("rose")}
                  className="bg-rose-500 hover:bg-rose-600"
                />
                <Button
                  size="icon"
                  onClick={() => applyColorScheme("orange")}
                  className="bg-orange-500 hover:bg-orange-600"
                />
                <Button
                  size="icon"
                  onClick={() => applyColorScheme("green")}
                  className="bg-green-500 hover:bg-green-600"
                />
                <Button
                  size="icon"
                  onClick={() => applyColorScheme("blue")}
                  className="bg-blue-500 hover:bg-blue-600"
                />
                <Button
                  size="icon"
                  onClick={() => applyColorScheme("yellow")}
                  className="bg-yellow-500 hover:bg-yellow-500"
                />
                <Button
                  size="icon"
                  onClick={() => applyColorScheme("violet")}
                  className="bg-violet-500 hover:bg-violet-500"
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Switch checked={hideEmail} onCheckedChange={setHideEmail} id="hide-email" />
                <Label htmlFor="hide-email">Hide email</Label>
              </div>
            </TabsContent>
            <TabsContent value="api-keys">Coming soon.</TabsContent>
            <TabsContent value="attachments">
              <Attachments />
            </TabsContent>
            <TabsContent value="help" className="space-y-2">
              <p className="my-4 text-sm dark:text-neutral-200">
                We listen. This app is completely open-source and any feedback we received from amazing users like you
                is worth gold to us.
              </p>
              <Alert>
                <Lightbulb />
                <AlertTitle>Have a feature request?</AlertTitle>
                <AlertDescription className="flex">
                  Let us know
                  <InlineLink href="https://github.com/subhoghoshX/chat/discussions">on github</InlineLink> or upvote an
                  existing one.
                </AlertDescription>
              </Alert>
              <Alert>
                <Bug />
                <AlertTitle>Found a bug?</AlertTitle>
                <AlertDescription>
                  <span>
                    Please <InlineLink href="https://github.com/subhoghoshX/chat/issues">file a report</InlineLink>. For
                    any other issues DM <InlineLink href="https://x.com/subhoghosh_">subho</InlineLink> on X.
                  </span>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </main>
      </Authenticated>
    </>
  );
}

function Attachments() {
  const userAttachments = useQuery(api.messages.getUserAttachments);

  return (
    <ul className="space-y-2">
      {userAttachments?.map((attachment) => <Attachment {...attachment} key={attachment.storageId} />)}
      {userAttachments?.length === 0 && "No attachments found."}
    </ul>
  );
}

function Attachment({ storageId, type, name }: { storageId: Id<"_storage">; type: string; name: string }) {
  const fileUrl = useQuery(api.messages.getFileUrl, { storageId });

  if (!fileUrl) return;

  return (
    <li>
      <a href={fileUrl} target="_blank" className="flex items-center gap-2">
        <Alert>
          {type.startsWith("image/") ? <ImageIcon /> : <FileText />}
          <AlertTitle>{name}</AlertTitle>
        </Alert>
      </a>
    </li>
  );
}
