import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="SimpleDex" className="h-32 w-auto mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">SimpleDex</h1>
        <p className="text-muted-foreground">Your quick reference for Pokemon</p>
      </div>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <p className="text-muted-foreground mb-4">
          SimpleDex is your quick reference for Pokemon, featuring the original 151 Pokemon from the
          Kanto region. Browse, search, and explore Pokemon details including stats, abilities, and
          evolutions.
        </p>
        <p className="text-muted-foreground">
          Data provided by{" "}
          <a href="https://pokeapi.co" className="text-primary hover:underline" target="_blank">
            PokeAPI
          </a>
          .
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Developer</h2>
        <p className="text-muted-foreground mb-4">
          Built by{" "}
          <a href="https://cavender.foo" className="text-primary hover:underline" target="_blank">
            Stephen Cavender
          </a>
          .
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Theme</h2>
        <p className="text-muted-foreground mb-4">
          Supports both light and dark themes using CSS custom properties. Toggle between themes
          using the system preference or manually.
        </p>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white text-black border">Light</span>
          <span className="px-3 py-1 rounded-full bg-black text-white">Dark</span>
        </div>
      </div>

      <div className="text-center">
        <Link to="/" className="text-primary hover:underline">
          ← Back to Pokemon List
        </Link>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>
          © 2026{" "}
          <a href="https://cavender.foo" className="hover:underline" target="_blank">
            Stephen Cavender
          </a>
        </p>
      </div>
    </div>
  );
}
