/**
 * PROTOTYPE: throwaway. Floating bar for flipping between ?variant= values.
 * Never renders in production builds.
 */
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function PrototypeSwitcher({
  variants,
  current,
}: {
  variants: readonly { key: string; label: string }[];
  current: string;
}): React.ReactElement | null {
  const navigate = useNavigate();
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const go = (step: number): void => {
    const next = variants[(index + step + variants.length) % variants.length];
    if (next)
      void navigate({ to: ".", search: (prev) => ({ ...prev, variant: next.key }), replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      )
        return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (import.meta.env.PROD) return null;
  const variant = variants[index];
  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <button type="button" onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        {index + 1}/{variants.length} · {variant?.key} ({variant?.label})
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}
