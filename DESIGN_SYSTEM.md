# SAMBO – Designsystem

Snabbguide för att hitta färger, typografi, mått, ikoner och komponenter i koden.

## 1. Färger
Definieras i `src/styles.css` (avsnitt 2–3), mappas till Tailwind i avsnitt 1. Använd alltid tokens (`bg-primary`, `text-task-ink`), aldrig hårdkodade färger.

| Token | Användning |
|---|---|
| `--background` | Mintgrön sidbakgrund |
| `--foreground` / `--primary` | Lila text, knappar, ikoner |
| `--card` | Uppgiftskort, statistikkort |
| `--task-sheet` | Bakgrund i bottenpanelen (Ny uppgift) |
| `--task-field` | Fältbakgrund (#D3EDDB-nära) |
| `--task-ink` | Text i fält |
| `--nav-active` | Markerad navigeringslänk (#EBE5F4) |
| `--profile-letter` | Ljusgrön ikonfärg på lila knappar (#D3EDDB) |
| `--destructive` | Fel/ta bort (WCAG AA-kontrast) |
| `--dialog-scrim` | Mörk bakgrund bakom dialoger |
| `--chart-1..5` | Diagramfärger |

## 2. Typografi
Typsnitt laddas i `src/routes/__root.tsx`, tokens i `styles.css`.
- **Figtree** (`font-sans`) – all text.
- **Titan One** (`font-display`) – logga/display.
- **Hammersmith One** (`font-profile`) – profilbokstäver.

Skala: sidrubrik `text-2xl font-bold`, sektionsrubrik `text-lg font-medium`, korttitel `text-lg font-bold`, fält 16px, detaljtext `text-sm`.

## 3. Mått, spacing & former
- Fält och knappar: **40 px** höjd, `rounded-full`.
- Textrutor: radie **20 px**, minhöjd 80 px.
- Kort: `rounded-lg` (8 px), padding 12 px.
- Kantavstånd i sidhuvud och paneler: **16 px**.
- Skugga: `shadow-task-field` på kort, knappar och fält.
- Fokusram: 2 px lila, bara vid tangentbordsnavigering (`:focus-visible`).

## 4. Ikoner
Alla i `src/components/sambo/icons.tsx` (egna SVG:er, inget ikonbibliotek), 24×24, färg via `text-*`.
- Formulär: `CalendarMonthIcon`, `AddBoxIcon`
- Kategorier: `HomeIcon`, `CarIcon`, `EventIcon`, `TravelIcon`, `CategoriesIcon` (+ `CategoryIcon`-hjälpare)
- Navigering: `TimedTasksIcon`, `UntimedTasksIcon`, `ShoppingListsIcon`, `HistoryIcon`
- Pilar: `ChevronLeftIcon`, `ChevronRightIcon`
- Gränssnitt: `CloseIcon`, `PlusIcon`, `ExpandMoreIcon`, `ExpandLessIcon`, `CheckIcon`, `ArrowBackIcon` (används även i `ui/`-primitiverna)
- Checkbox (20×20): `CheckboxCircleIcon`, `CheckboxFilledIcon`

## 5. Komponenter
**App-specifika** (`src/components/sambo/`):
| Komponent | Syfte |
|---|---|
| `AppShell` | Sidhuvud, bottennavigering, FAB, utloggning, profilbyte |
| `CreateTaskDialog` | Skapa/redigera uppgift |
| `TaskCard` | Kort i listvyer (+ `Section`, `EmptyState`) |
| `TaskDetail` | Detaljpanel för uppgift |
| `SamboCheckbox` | Rund lila checkbox |
| `CardSwiper` | Kort i sidled med pilar |
| `StatsPie` | Cirkeldiagram i ren SVG (inget diagrambibliotek) |

**Basprimitiver** (`src/components/ui/`): button, input, textarea, select, dialog, sheet, popover, label, sonner.

Datum formateras med inbyggda `Intl.DateTimeFormat("sv-SE")` – inget datumbibliotek.

## 6. Sidor
`src/routes/_authenticated/`: `index` (Tidsbegränsat), `backlog`, `inkopslistor`, `kategorier`, `statistik`. Inloggning: `src/routes/auth.tsx`.

## 7. Logik
Regler (poäng, återkommande, datum) i `src/lib/sambo-logic.ts` med tester; data i `src/lib/sambo-store.ts`.
