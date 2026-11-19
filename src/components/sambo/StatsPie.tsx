/**
 * StatsPie – cirkeldiagram (Recharts) för statistik, färger från --chart-1..5.
 * Se DESIGN_SYSTEM.md -> Komponenter.
 */
import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Slice { label: string; value: number }

export function StatsPie({ title, slices, unit }: { title: string; slices: Slice[]; unit: string }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const data = slices.map((slice, index) => ({ ...slice, fill: `var(--chart-${(index % 5) + 1})` }));
  return (
    <figure className="min-w-0 space-y-3 rounded-lg bg-card p-4 shadow-task-field">
      <figcaption className="font-semibold">{title}</figcaption>
      <div className="relative mx-auto h-44 w-44">
        <ChartContainer
          role="img"
          config={{ value: { label: unit } }}
          className="h-full w-full aspect-square"
          aria-label={`${title}: ${slices.map((s) => `${s.label} ${s.value} ${unit}`).join(", ")}`}
        >
          <PieChart>
            <Pie data={total ? data : [{ label: "Ingen statistik ännu", value: 1, fill: "var(--background)" }]} dataKey="value" nameKey="label" innerRadius={55} outerRadius={82} stroke="var(--card)" strokeWidth={3} isAnimationActive={false}>
              {(total ? data : [{ fill: "var(--background)" }]).map((slice, index) => <Cell key={index} fill={slice.fill} />)}
            </Pie>
            {total > 0 && <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, name) => <span>{name}: {value} {unit}</span>} />} />}
          </PieChart>
        </ChartContainer>
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
