import { useAuthActions } from "@convex-dev/auth/react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type AuthFlow = "signIn" | "signUp";

export default function AuthDialog({ children }: { children: ReactNode }) {
  const { signIn } = useAuthActions();
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<AuthFlow>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);

    try {
      await signIn("password", formData);
      setOpen(false);
    } catch (error) {
      setError(formatAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{flow === "signIn" ? "Log in" : "Create account"}</DialogTitle>
          <DialogDescription>Use an email and password to access your saved chats.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submitAuth}>
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input id="auth-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={flow === "signIn" ? "current-password" : "new-password"}
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : flow === "signIn" ? "Log in" : "Create account"}
          </Button>
        </form>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setError(null);
            setFlow(flow === "signIn" ? "signUp" : "signIn");
          }}
        >
          {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function formatAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("Invalid password")) {
    return "Password must be at least 8 characters.";
  }

  if (message.includes("Invalid credentials")) {
    return "Email or password is incorrect.";
  }

  if (message.includes("already exists")) {
    return "An account with this email already exists.";
  }

  return "Authentication failed. Please try again.";
}
