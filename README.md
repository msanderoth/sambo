# SAMBO – Håll koll på vardagen tillsammans

SAMBO är en webbapp skapad för att göra det enkelt och roligt för sambor att organisera sitt gemensamma liv. Genom att samla sysslor, projekt och inköp på ett ställe – och belöna avklarade uppgifter med poäng – blir det lättare att hjälpas åt och få överblick över hushållets ansvarsfördelning.

## Vad appen är till för

- **Gemensam överblick:** Håll koll på allt från veckohandling och städning till bilbesiktning och semesterplaner i realtid mellan era enheter.
- **Tydlig ansvarsfördelning:** Skapa enkla sysslor, detaljerade checklistor eller inköpslistor med deadlines och återkommande intervall.
- **Lekfull motivation:** Varje skapad och avklarad uppgift ger poäng till den aktiva profilen, vilket sammanställs i visuell statistik.

## Så använder du appen

### 1. Inloggning och hushåll

När du öppnar SAMBO loggar du in på ert gemensamma hushållskonto med användarnamn (eller den kopplade e-postadressen) och lösenord. All data synkas automatiskt mellan era telefoner och datorer.

### 2. Växla profil

Uppe i det högra hörnet växlar du snabbt aktiv profil mellan **M** och **J** med ett enkelt tryck. Den profil som är vald får poängen när uppgifter skapas och slutförs.

### 3. De fem vyerna

Navigera mellan appens sidor i menyraden längst ner:

- **Tidsbegränsat:** Uppgifter och inköpslistor som har ett satt slutdatum, sorterade med tydliga etiketter som _Idag_, _Imorgon_ eller veckodag.
- **Backlog:** Hushållets alla öppna uppgifter och projekt samlade på ett ställe (exklusive rena inköpslistor).
- **Inköpslistor:** Alla era inköpslistor med snabb avbockning för varor och saker som ska handlas.
- **Kategorier:** Filtrera uppgifter efter områden: _Hem_, _Bil_, _Event_, _Resa_ eller egna tillagda kategorier.
- **Statistik:** Cirkeldiagram som visar total poängfördelning, prestation per person samt hur mycket poäng ni samlat inom respektive kategori.

### 4. Skapa och hantera uppgifter

- Tryck på den runda **plusknappen (+)** nere till höger för att skapa en ny uppgift eller inköpslista.
- Fyll i titel (obligatoriskt), kategori, beskrivning, listpunkter, eventuellt slutdatum, upprepningsintervall eller koppla till relaterade uppgifter.
- Tryck på ett kort för att se detaljer, bocka av listpunkter, redigera eller markera som slutförd.
- Uppe till vänster loggar du ut från hushållet på den enhet du använder.

## Kom igång lokalt (utveckling)

Vill du köra eller vidareutveckla SAMBO på din egen dator?

### Förutsättningar

- [Node.js](https://nodejs.org/) (version 18 eller senare) eller [Bun](https://bun.sh/)
- npm eller bun

### Installation och start

1. Klona projektet:

   ```sh
   git clone <repo-url>
   cd <repository-name>
   ```

2. Installera beroenden:

   ```sh
   npm install
   # eller
   bun install
   ```

3. Starta utvecklingsservern:

   ```sh
   npm run dev
   # eller
   bun run dev
   ```

4. Öppna webbläsaren på [http://localhost:8080](http://localhost:8080).

### Tester och kvalitet

```sh
npm run test      # kör enhetstester (vitest)
npm run lint      # kör eslint
npm run build     # bygg för produktion
```

## Byggd med Lovable

This project was built with [Lovable](https://lovable.dev).

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3f384260-88e4-418b-b6e0-c305ed6bb7ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
