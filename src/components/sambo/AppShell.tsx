import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { TimedTasksIcon as CalendarClock, UntimedTasksIcon as ClipboardCheck, ShoppingListsIcon as ListChecks, CategoriesIcon as LayoutGrid, HistoryIcon as History } from "./icons";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { actions, useSambo } from "@/lib/sambo-store";
import { CreateTaskDialog } from "./CreateTaskDialog";
import samboLogo from "@/assets/sambo-logo.svg.asset.json";
import profilM from "@/assets/profil-m.svg.asset.json";
import profilJ from "@/assets/profil-j.svg.asset.json";
import logoutIcon from "@/assets/logout.svg.asset.json";

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
  const [confirmLogout, setConfirmLogout] = useState(false);
  const navigate = useNavigate();
  const signOut = async () => { setConfirmLogout(false); await actions.signOut(); await navigate({ to: "/auth", search: { redirect: undefined }, replace: true }); };
  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-32">
      <header className="sticky top-0 z-30 -mx-4 mb-4 bg-background px-4 pb-1 pt-3 text-center">
        <img src={samboLogo.url} alt="SAMBO" width={123} height={40} className="mx-auto h-12 w-auto max-w-[calc(100%-6rem)] object-contain" />
        <button onClick={() => setConfirmLogout(true)} aria-label="Logga ut" className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full">
          <img src={logoutIcon.url} alt="" width={24} height={24} className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold uppercase">{title}</h1>
        <button
          onClick={actions.toggleProfile}
          aria-label={`Aktiv profil: ${profile}. Byt profil`}
          className="absolute right-4 top-4 h-10 w-10 rounded-full"
        >
          <img src={profile === "M" ? profilM.url : profilJ.url} alt={profile} width={40} height={40} className="h-10 w-10" />
        </button>
      </header>
      <main className="space-y-6">{children}</main>
      <button onClick={() => setOpen(true)} aria-label="Ny uppgift" className="fixed bottom-24 right-[max(1rem,calc(50%-12rem))] z-20 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
        <Plus className="h-8 w-8 text-profile-letter" />
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
      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent
          aria-describedby={undefined}
          className="w-[calc(100%-2rem)] max-w-xs gap-0 rounded-[20px] border-0 bg-task-sheet p-6 text-task-ink shadow-none sm:rounded-[20px] [&>.dialog-dismiss]:hidden"
        >
          <DialogTitle className="text-center text-xl font-bold">Vill du logga ut?</DialogTitle>
          <div className="mt-6 flex gap-2">
            <Button
              variant="ghost"
              className="h-10 flex-1 rounded-full bg-task-field text-base font-normal text-task-ink shadow-task-field hover:bg-task-field/80 hover:text-task-ink"
              onClick={() => setConfirmLogout(false)}
            >
              Gå tillbaka
            </Button>
            <Button
              className="h-10 flex-1 rounded-full bg-task-ink text-base font-normal text-task-field shadow-task-field hover:bg-task-ink/90"
              onClick={signOut}
            >
              Logga ut
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
