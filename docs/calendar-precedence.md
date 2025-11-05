# Liturgical Calendar Precedence Plan

This note captures the rules and data we need in order to choose the correct Divinum Officium files for any civil date under the 1960 rubrics (the regime used by DO’s “Rubrics 1960” setting, which Vigil targets initially).

## 1. Rank & Precedence Hierarchy

We model rank as an ordered list. Higher entries trump lower entries when multiple observances coincide.

1. **First-Class**
   - Triduum (Holy Thursday → Holy Saturday)
   - Easter & Pentecost Sundays + Octave days of Easter/Pentecost
   - Christmas Day, Epiphany, Ascension, Corpus Christi
   - Immaculate Conception, Sacred Heart, Christ the King
   - Patronal solemnities (local, TBD)
2. **Second-Class**
   - Sundays of Advent, Lent, Passiontide, Eastertide
   - Some major feasts (e.g., Candlemas, Annunciation, Sts. Peter & Paul)
3. **Third-Class**
   - Feasts of the saints designated III class in DO metadata
   - Sundays of Ordinary Time (after Epiphany/Pentecost)
4. **Commemorations (Fourth-Class)**
   - Ferias, simple feasts, optional memorials

Sundays outrank most saints unless the saint is first-class with precedence over that Sunday. Feria days during privileged seasons (Advent, Lent, Passiontide) outrank simple saints; otherwise they yield to saints.

## 2. Observance Resolution Algorithm

Given a civil date:

1. Compute base season/week using existing helpers (`calculateEaster`, etc.).
2. Determine the **temporal office** candidate: `<SeasonWeek>-<weekday>.txt` from `Tempora/`.
3. Determine the **fixed office** candidate: `<MM>-<DD>.txt` from `Sancti/` (if file exists).
4. Determine the **common office** fallback based on saint class (martyr, confessor, pontiff, virgin…). DO’s `Sancti` files usually include directives like `@Commune/C4`—we must parse saint metadata (first lines in `Sancti/XX-YY.txt` or a separate lookup table) to know which commune to use when props missing.
5. Evaluate precedence:
   - If both temporal and saint offices exist, compare ranks.
   - If ranks tie, apply traditional tie-breakers (e.g., temporal outranks unless saint is celebrated in place, or commemorations).
   - Record secondary observances as commemorations for the renderer (e.g., Sunday with commemorated saint collects).
6. Apply rubrical adjustments:
   - Vigils: if a vigil falls on same day as higher-rank feast, vigil is omitted or commemorated.
   - Octaves: certain Octave days change precedence (e.g., Octave of Christmas).
   - Ember Days: special ferias with sub-week ranking.

## 3. Data Inputs Needed

- **Saint metadata table**: For each `Sancti` file include rank (1st/2nd/3rd/Commemoration) and saint class (martyr, virgin, bishop, doctor). Option sources:
  - Parse `Rank` section in each file (`[Rank]` present in DO data).
  - Fallback to manual JSON mapping for tricky cases.
- **Temporal metadata**: Determine rank of the temporal day (e.g., `Adv1-0` is Second-Class Sunday). We can encode this in a lookup keyed by `week` and `dayOfWeek`.
- **Seasonal constraints**: Table describing privileged ferias (Advent 17–24 Dec, Ash Wednesday, Holy Week) that outrank certain saints.
- **Optional toggles**: Flags for users selecting “commemorate optional memorials” or choosing local calendars (future work).

## 4. Proposed Data Structures

```js
const RANKS = ['feria', 'memorial', 'third', 'second', 'first']; // ascending

const TEMPORA_TABLE = {
  'Adv1-0': { rank: 'second', title: 'First Sunday of Advent' },
  'Adv1-1': { rank: 'feria', class: 'advent-feria' },
  'Quadp1-3': { rank: 'feria', class: 'ember' },
  // ...
};

const SAINT_META = {
  '10-04': { rank: 'third', commune: 'C2', class: 'confessor', title: 'St. Francis of Assisi' },
  // ...
};
```

`LiturgicalCalendar.getLiturgicalDay()` will return:

```js
{
  date: '2025-10-04',
  season: 'ordinary',
  week: 'Pent18',
  dayOfWeek: 6,
  observances: [
    { type: 'tempora', file: 'Pent18-6.txt', rank: 'feria', title: 'Saturday after the 18th Sunday after Pentecost' },
    { type: 'sancti', file: '10-04.txt', rank: 'third', title: 'St. Francis of Assisi', commune: 'C2' }
  ],
  primary: { type: 'sancti', rank: 'third', file: '10-04.txt' },
  commemorations: [ { type: 'tempora', file: 'Pent18-6.txt' } ]
}
```

## 5. Implementation Tasks

1. **Saint metadata extraction**
   - Parse `[Rank]` section to derive rank and commune hints.
   - Cache results for quick lookup.
2. **Temporal metadata table**
   - Hard-code rank/labels for Sundays, ferias, vigils, ember days, octave days.
   - Provide helper `getTemporalRank(weekKey, weekday)`.
3. **Precedence resolution**
   - Implement comparison function using rank order + seasonal rules.
   - Determine commemorations when secondary observance is suppressed.
4. **API update**
   - Expand `getLiturgicalDay` to return `observances`, `primary`, `commemorations`.
   - `determineFiles` becomes a reduction over `observances` rather than blind string building.
5. **Tests / fixtures**
   - Prepare sample civil dates with expected outputs (e.g., 2025-12-08, 2025-03-19, 2025-09-14).

## 6. Open Questions

- Local calendars & patronal feasts: out of scope for first pass; design data model to inject later.
- Optional memorial handling: allow toggle to celebrate memorial (`primary = sancti`) vs. just commemorate.
- Multiple saints on same day: DO sometimes lists `(simplex)` second entries; need policy (choose highest rank, treat others as commemorations).

With this plan we can now start implementing metadata extraction and the precedence logic in `src/calendar.js`.
