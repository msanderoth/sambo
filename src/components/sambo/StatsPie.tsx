/**
 * StatsPie – cirkeldiagram (ringdiagram) i ren SVG för statistik, färger från --chart-1..5.
 * Inga diagrambibliotek: varje del ritas som en cirkelbåge med stroke-dasharray.
 * Se DESIGN_SYSTEM.md -> Komponenter.
 */
interface Slice { label: string; value: number }

const R = 34; // radie i viewBox 0 0 100 100
const C = 2 * Math.PI * R;

export function StatsPie({ title, slices, unit }: { title: string; slices: Slice[]; unit: string }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let offset = 0;
  return (
    <figure className="min-w-0 space-y-3 rounded-lg bg-card p-4 shadow-task-field">
      <figcaption className="font-semibold">{title}</figcaption>
      <div className="relative mx-auto h-44 w-44">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`${title}: ${slices.map((s) => `${s.label} ${s.value} ${unit}`).join(", ")}`}
        >
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--background)" strokeWidth="18" />
          {total > 0 && slices.map((slice, index) => {
            const len = (slice.value / total) * C;
            const el = slice.value > 0 && (
              <circle key={slice.label} cx="50" cy="50" r={R} fill="none" stroke={`var(--chart-${(index % 5) + 1})`} strokeWidth="18" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}>
                <title>{`${slice.label}: ${slice.value} ${unit}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span className="text-2xl font-bold tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {slices.map((slice, index) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ background: `var(--chart-${(index % 5) + 1})` }} />
            <span className="min-w-0 flex-1 break-words">{slice.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{slice.value} {unit}</span>
            <span className="w-10 shrink-0 text-right text-muted-foreground tabular-nums">{total ? Math.round(slice.value / total * 100) : 0}%</span>
          </li>
        ))}
      </ul>
      {total === 0 && <p className="text-center text-xs text-muted-foreground">Ingen statistik ännu.</p>}
    </figure>
  );
}
