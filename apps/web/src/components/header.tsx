import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { api } from "@simpledex/backend/convex/_generated/api";
import { Button } from "@simpledex/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simpledex/ui/components/dropdown-menu";

import { ModeToggle } from "./mode-toggle";

function UserAvatar({ name, email, image }: { name?: string | null; email?: string | null; image?: string | null }) {
  const initial = (name ?? email ?? "U").charAt(0).toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="h-7 w-7 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
      {initial}
    </span>
  );
}

export default function Header() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.auth.getCurrentUser);
  const router = useRouter();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
  ] as const;

  const handleSignOut = () => {
    void signOut().then(() => router.invalidate());
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold tracking-tight">
            SimpleDex
          </Link>
          <nav className="flex items-center gap-5">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />

          {isLoading ? null : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium outline-none transition-colors hover:bg-accent">
                  <UserAvatar name={user.name} email={user.email} image={user.image} />
                  <span className="hidden sm:inline">{user.name ?? user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link to="/_authenticated/favorites">Favorites</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
