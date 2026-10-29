/**
 * PROTOTYPE: throwaway. Lives on branch prototype/evolution-layouts only.
 * Question: how should branching Evolution Chains be laid out on the detail page?
 * Five variants of the Evolutions section, switchable via ?variant= on /pokemon/$id.
 */
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { PokemonImage } from "@/components/pokemon-image";

interface Stage {
  id: number;
  name: string;
  sprite: string;
  from?: number;
  method?: string;
}

interface EvoNode {
  stage: Stage;
  children: EvoNode[];
}

export const EVOLUTION_VARIANTS = [
  { key: "current", label: "Current (arrow before every stage)" },
  { key: "tree", label: "Horizontal tree" },
  { key: "columns", label: "Stage columns" },
  { key: "table", label: "Evolution table" },
  { key: "focus", label: "Current-centric" },
] as const;

/** Chains worth flipping through while judging the layouts. */
export const PROTOTYPE_EXAMPLES = [
  { id: 133, label: "Eevee (8 branches)" },
  { id: 43, label: "Oddish (branch at stage 2)" },
  { id: 265, label: "Wurmple (two paths)" },
  { id: 236, label: "Tyrogue (3, baby)" },
  { id: 280, label: "Ralts" },
  { id: 840, label: "Applin" },
  { id: 1, label: "Bulbasaur (linear)" },
  { id: 172, label: "Pichu (baby, linear)" },
  { id: 132, label: "Ditto (single)" },
];

function buildTree(stages: Stage[]): EvoNode | undefined {
  const build = (stage: Stage): EvoNode => ({
    stage,
    children: stages.filter((s) => s.from === stage.id).map(build),
  });
  const root = stages.find((s) => s.from === undefined);
  return root ? build(root) : undefined;
}

function depthOf(stages: Stage[], stage: Stage): number {
  const parent = stages.find((s) => s.id === stage.from);
  return parent ? depthOf(stages, parent) + 1 : 0;
}

function StageLink({
  stage,
  currentId,
  size = "sm",
}: {
  stage: Stage;
  currentId: number;
  size?: "sm" | "md";
}) {
  const isCurrent = stage.id === currentId;
  return (
    <Link
      to="/pokemon/$id"
      params={{ id: String(stage.id) }}
      search={(prev) => prev}
      className="block text-center"
    >
      <PokemonImage
        src={stage.sprite}
        name={stage.name}
        size={size === "md" ? "md" : "sm"}
        className={`mx-auto hover:scale-110 transition-transform ${isCurrent ? "ring-2 ring-primary rounded-full" : ""}`}
      />
      <p className={`text-sm capitalize mt-1 ${isCurrent ? "font-semibold" : ""}`}>{stage.name}</p>
    </Link>
  );
}

// ─── current: today's layout ────────────────────────────────────────────────

function Current({ stages, currentId }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stages.map((stage) => (
        <Fragment key={stage.id}>
          {stage.from !== undefined && <span className="text-2xl mx-1">→</span>}
          <div className="text-center">
            <StageLink stage={stage} currentId={currentId} />
            {stage.method && <p className="text-xs text-muted-foreground">{stage.method}</p>}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

// ─── tree: evolutions stack to the right of what they evolve from ───────────

function TreeNode({ node, currentId }: { node: EvoNode; currentId: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0">
        <StageLink stage={node.stage} currentId={currentId} />
      </div>
      {node.children.length > 0 && (
        <div className="flex flex-col gap-3 border-l border-border pl-3">
          {node.children.map((child) => (
            <div key={child.stage.id} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                {child.stage.method}
                <span className="ml-1 text-base text-foreground">→</span>
              </div>
              <TreeNode node={child} currentId={currentId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tree({ stages, currentId }: Props) {
  const tree = buildTree(stages);
  return (
    <div className="overflow-x-auto pb-2">
      {tree && <TreeNode node={tree} currentId={currentId} />}
    </div>
  );
}

// ─── columns: one column per stage depth ────────────────────────────────────

function Columns({ stages, currentId }: Props) {
  const byDepth: Stage[][] = [];
  for (const stage of stages) (byDepth[depthOf(stages, stage)] ??= []).push(stage);
  const names = new Map(stages.map((s) => [s.id, s.name]));
  const branches = (depth: number): boolean =>
    new Set((byDepth[depth] ?? []).map((s) => s.from)).size > 1;
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {byDepth.map((column, depth) => (
        <Fragment key={depth}>
          {depth > 0 && <div className="self-center text-2xl text-muted-foreground">→</div>}
          <div className="min-w-28 rounded-lg bg-muted/50 p-3">
            <p className="mb-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
              {depth === 0 ? "Base" : `Stage ${depth}`}
            </p>
            <div className="flex flex-col gap-3">
              {column.map((stage) => (
                <div key={stage.id}>
                  <StageLink stage={stage} currentId={currentId} />
                  {stage.method && (
                    <p className="text-center text-xs text-muted-foreground">
                      {stage.method}
                      {branches(depth) && stage.from !== undefined && (
                        <span className="block capitalize">from {names.get(stage.from)}</span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

// ─── table: one row per evolution ───────────────────────────────────────────

function Table({ stages, currentId }: Props) {
  const byId = new Map(stages.map((s) => [s.id, s]));
  const edges = stages.filter((s) => s.from !== undefined);
  if (edges.length === 0) return <p className="text-sm text-muted-foreground">Does not evolve.</p>;
  return (
    <div className="divide-y rounded-lg border">
      {edges.map((to) => {
        const from = byId.get(to.from ?? -1);
        const involved = to.id === currentId || to.from === currentId;
        return (
          <div
            key={to.id}
            className={`grid grid-cols-[1fr_auto_1fr_1.5fr] items-center gap-2 px-3 py-2 ${involved ? "bg-accent" : ""}`}
          >
            {from && <MiniStage stage={from} currentId={currentId} />}
            <span className="text-muted-foreground">→</span>
            <MiniStage stage={to} currentId={currentId} />
            <span className="text-sm text-muted-foreground">{to.method}</span>
          </div>
        );
      })}
    </div>
  );
}

function MiniStage({ stage, currentId }: { stage: Stage; currentId: number }) {
  return (
    <Link
      to="/pokemon/$id"
      params={{ id: String(stage.id) }}
      search={(prev) => prev}
      className="flex items-center gap-2"
    >
      <PokemonImage src={stage.sprite} name={stage.name} size="sm" className="!h-12 !w-12" />
      <span className={`text-sm capitalize ${stage.id === currentId ? "font-semibold" : ""}`}>
        {stage.name}
      </span>
    </Link>
  );
}

// ─── focus: what this Pokémon evolves from / into, plus the family ──────────

function Focus({ stages, currentId }: Props) {
  const current = stages.find((s) => s.id === currentId);
  const from = stages.find((s) => s.id === current?.from);
  const into = stages.filter((s) => s.from === currentId);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Evolves from
          </p>
          {from ? (
            <div className="flex items-center gap-3">
              <MiniStage stage={from} currentId={currentId} />
              <span className="text-xs text-muted-foreground">{current?.method}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing: this is the first stage.</p>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Evolves into
          </p>
          {into.length > 0 ? (
            <div className="space-y-2">
              {into.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <MiniStage stage={s} currentId={currentId} />
                  <span className="text-xs text-muted-foreground">{s.method}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing: this is a final stage.</p>
          )}
        </div>
      </div>
      {stages.length > 1 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Family</p>
          <div className="flex flex-wrap gap-1">
            {stages.map((s) => (
              <Link
                key={s.id}
                to="/pokemon/$id"
                params={{ id: String(s.id) }}
                search={(prev) => prev}
                title={s.name}
                className={`rounded-full ${s.id === currentId ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"}`}
              >
                <PokemonImage src={s.sprite} name={s.name} size="sm" className="!h-10 !w-10" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── switch ─────────────────────────────────────────────────────────────────

interface Props {
  stages: Stage[];
  currentId: number;
}

export function EvolutionsPrototype({ variant, ...props }: Props & { variant: string }) {
  return (
    <div className="space-y-4">
      {variant === "tree" ? (
        <Tree {...props} />
      ) : variant === "columns" ? (
        <Columns {...props} />
      ) : variant === "table" ? (
        <Table {...props} />
      ) : variant === "focus" ? (
        <Focus {...props} />
      ) : (
        <Current {...props} />
      )}
      <p className="border-t pt-2 text-xs text-muted-foreground">
        Prototype examples:{" "}
        {PROTOTYPE_EXAMPLES.map((e, i) => (
          <Fragment key={e.id}>
            {i > 0 && " · "}
            <Link
              to="/pokemon/$id"
              params={{ id: String(e.id) }}
              search={(prev) => prev}
              className="underline"
            >
              {e.label}
            </Link>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
