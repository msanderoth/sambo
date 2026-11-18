import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

/**
 * A row of full-width cards that can be swiped sideways, with a chevron button
 * on each side for tapping instead of swiping. The button on a side disappears
 * once there is nothing left to scroll in that direction.
 */
export function CardSwiper({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const arrow = "absolute top-[140px] z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-primary text-profile-letter shadow-task-field transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-0";

  return (
    <div className="relative">
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={edges.start}
        aria-label={`Föregående ${label}`}
        className={`${arrow} left-1`}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={edges.end}
        aria-label={`Nästa ${label}`}
        className={`${arrow} right-1`}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
