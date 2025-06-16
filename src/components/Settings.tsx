import { SignInButton, useUser } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Bug, ImageIcon, Lightbulb, LoaderCircle } from "lucide-react";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { applyColorScheme } from "@/lib/colorscheme";
import { api } from "../../convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import InlineLink from "./InlineLink";

export default function Settings() {
  const { user } = useUser();

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
        <main className="flex w-full justify-center gap-10 pt-20">
          <section className="flex flex-col">
            <Avatar className="size-32 rounded-[20px]">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>Hey</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="mt-3 text-xl font-medium">{user?.fullName}</h2>
              <p className="text-sm text-neutral-500">{user?.emailAddresses?.[0].emailAddress}</p>
              <Progress value={3} className="mt-3" />
              <Badge className="mt-3" variant="secondary">
                Free Tier
              </Badge>
            </div>
          </section>
          <Tabs defaultValue="appearance">
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
            </TabsContent>
            <TabsContent value="api-keys">Coming soon.</TabsContent>
            <TabsContent value="attachments">
              <Attachments />
            </TabsContent>
            <TabsContent value="help" className="space-y-2">
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
                <AlertDescription className="flex">
                  Please <InlineLink href="https://github.com/subhoghoshX/chat/issues">file a report.</InlineLink> For
                  other issues DM <InlineLink href="https://x.com/subhoghosh_">subho</InlineLink> on X.
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

  return <ul>{userAttachments?.map((attachment) => <Attachment {...attachment} key={attachment.storageId} />)}</ul>;
}

function Attachment({ storageId, type }: { storageId: Id<"_storage">; type: string }) {
  const fileUrl = useQuery(api.messages.getFileUrl, { storageId });

  if (!fileUrl) return;

  return (
    <li>
      <a href={fileUrl} target="_blank" className="flex items-center gap-2">
        <Alert>
          <ImageIcon />
          <AlertTitle>{type}</AlertTitle>
        </Alert>
      </a>
    </li>
  );
}
