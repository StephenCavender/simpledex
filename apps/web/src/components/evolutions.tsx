import { evolutionLinks, type EvolutionLink, type EvolutionStage } from "@simpledex/pokedex";
import { Link } from "@tanstack/react-router";
import { PokemonImage } from "@/components/pokemon-image";

/** The detail page's Evolutions section: this Pokémon's links, then its whole Evolution Chain. */
export function Evolutions({
  stages,
  pokedexNumber,
}: {
  stages: EvolutionStage[];
  pokedexNumber: number;
}): React.ReactElement {
  if (stages.length <= 1) {
    return <p className="text-sm text-muted-foreground">Does not evolve.</p>;
  }
  const { from, into, chain } = evolutionLinks(stages, pokedexNumber);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <section aria-label="Evolves from">
          <Label>Evolves from</Label>
          {from ? (
            <LinkRow link={from} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing: this is the first stage.</p>
          )}
        </section>
        <section aria-label="Evolves into">
          <Label>Evolves into</Label>
          {into.length > 0 ? (
            <div className="space-y-2">
              {into.map((link) => (
                <LinkRow key={link.stage.id} link={link} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing: this is a final stage.</p>
          )}
        </section>
      </div>
      <section aria-label="Evolution chain">
        <Label>Evolution chain</Label>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {chain.map((stage) => {
            const isCurrent = stage.id === pokedexNumber;
            return (
              <Link
                key={stage.id}
                to="/pokemon/$id"
                params={{ id: String(stage.id) }}
                aria-current={isCurrent ? "page" : undefined}
                className={`w-16 text-center ${isCurrent ? "" : "opacity-70 hover:opacity-100"}`}
              >
                <PokemonImage
                  src={stage.sprite}
                  name={stage.name}
                  size="xs"
                  className={`mx-auto ${isCurrent ? "rounded-full ring-2 ring-primary" : ""}`}
                />
                <span
                  className={`block truncate text-xs capitalize ${isCurrent ? "font-semibold" : ""}`}
                >
                  {stage.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  return <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function LinkRow({ link }: { link: EvolutionLink }): React.ReactElement {
  return (
    <Link
      to="/pokemon/$id"
      params={{ id: String(link.stage.id) }}
      className="flex items-center gap-3 rounded-md hover:bg-accent"
    >
      <PokemonImage src={link.stage.sprite} name={link.stage.name} size="xs" />
      <span className="text-sm font-medium capitalize">{link.stage.name}</span>
      {link.method && <span className="text-xs text-muted-foreground">{link.method}</span>}
    </Link>
  );
}
