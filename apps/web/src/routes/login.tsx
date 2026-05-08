import { useAuthActions } from "@convex-dev/auth/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@simpledex/ui/components/button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuthActions();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to SimpleDex</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to save favorites and track your Pokédex progress.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button
          onClick={() => void signIn("google", { redirectTo: window.location.origin })}
          className="w-full"
          size="lg"
        >
          Sign in with Google
        </Button>
        <Button
          onClick={() => void signIn("discord", { redirectTo: window.location.origin })}
          className="w-full"
          variant="secondary"
          size="lg"
        >
          Sign in with Discord
        </Button>
      </div>
    </div>
  );
}
