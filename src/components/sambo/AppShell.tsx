import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, ClipboardCheck, ListChecks, LayoutGrid, History, Plus } from "lucide-react";
import { actions, useSambo } from "@/lib/sambo-store";
import { CreateTaskDialog } from "./CreateTaskDialog";
import samboLogo from "@/assets/sambo-logo.svg.asset.json";

const NAV = [
  { to: "/", icon: CalendarClock, label: "Tidsbegränsat" },
  { to: "/backlog", icon: ClipboardCheck, label: "Backlog" },
  { to: "/inkopslistor", icon: ListChecks, label: "Inköpslistor" },
  { to: "/kategorier", icon: LayoutGrid, label: "Kategorier" },
  { to: "/statistik", icon: History, label: "Statistik" },
] as const;

export function Page({ title, children }: { title: string; children: ReactNode }) {
  const { profile } = useSambo();
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-32 pt-3">
      <header className="relative mb-4 text-center">
        <img src={samboLogo.url} alt="SAMBO" width={123} height={40} className="mx-auto h-12 w-auto max-w-[calc(100%-6rem)] object-contain" />
        <h1 className="text-xl font-bold uppercase">{title}</h1>
        <button
          onClick={actions.toggleProfile}
          aria-label={`Aktiv profil: ${profile}. Byt profil`}
          className="absolute right-0 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
        >
          {profile[0]}
        </button>
      </header>
      <main className="space-y-6">{children}</main>
      <button onClick={() => setOpen(true)} aria-label="Ny uppgift" className="fixed bottom-24 right-[max(1rem,calc(50%-12rem))] z-20 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
        <Plus className="h-8 w-8" />
      </button>
      <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-[22rem] -translate-x-1/2 justify-between rounded-full bg-secondary px-5 py-2">
        {NAV.map(({ to, icon: I, label }) => (
          <Link key={to} to={to} aria-label={label} activeOptions={{ exact: true }}
            activeProps={{ className: "bg-nav-active" }}
            className="flex h-10 w-10 items-center justify-center rounded-full">
            <I className="h-5 w-5" />
          </Link>
        ))}
      </nav>
      <CreateTaskDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
