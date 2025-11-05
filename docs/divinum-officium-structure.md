# Divinum Officium Source Structure Cheatsheet

This note documents how the bundled Divinum Officium (DO) corpus is organised so we can locate the correct texts while building Vigil’s data pipeline.

## Top-Level Layout

`divinum-officium/web/www/horas` contains one subdirectory per supported language or observance (e.g. `English`, `Latin`, `Magyar`, `TemporaOP`). Each language directory shares the same internal shape:

- `Tempora/` – seasonal propers keyed by liturgical week and day (e.g. `Pent13-0.txt` for the 13th Sunday after Pentecost, `Adv3-4.txt` for Thursday of Advent week 3). Variants such as `TemporaM/` (Monastic) and `TemporaOP/` (Dominican) override the default cycle for those observances.
- `Sancti/` – fixed-date propers for saints and feasts (`MM-DD.txt`, e.g. `10-04.txt` for St. Francis). `SanctiM/` provides monastic alterations.
- `Commune/` – common texts used when a saint lacks proper sections (e.g. `C2.txt` Common of Apostles, `C10.txt` BVM). `CommuneM/` again supplies monastic variants.
- `Psalterium/` – shared psalter and invitatory material referenced by both Tempora and Sancti offices.
- `Martyrologium/`, `Regula/`, `Ordinarium/` – ancillary texts (martyrology, rule, ordinary) that may be pulled in by references.

Images (`*.jpg`, `*.png`) and helper files (`horas.setup`, `horas.dialog`, `ruler.txt`) are relics of the legacy CGI front end and can be ignored for extraction.

## File Anatomy

Every office file is plain text split into bracketed sections:

```
[Officium]
Dominica XIII Post Pentecosten

[Oratio]
Almighty and everlasting God...
$Per Dominum

[Lectio7]
From the Holy Gospel according to Luke
!Luke 17:11-19
```

Common section names include `Officium`, `Oratio`, `Ant Laudes`, `Hymnus Vespera`, `Lectio1`‑`Lectio9`, `Capitulum`, `Responsory`, etc. The section label often encodes the hour that should consume the content.

## Rubrical Tokens

- Lines beginning with `!` provide scripture or rubric references that should be preserved with styling (`!Luke 11:27-28`).
- A single underscore `_` separates narration from the following commentary.
- Tokens starting with `$` expand into standard conclusions (e.g. `$Per Dominum`, `$Qui vivis`).
- `&` markers such as `&teDeum`, `&Gloria` flag optional inserts or chant cues.

## Reference Directives

DO reuses content heavily through `@` directives embedded inside sections. The syntax is flexible:

- `@Commune/C10` – include an entire target file.
- `@Tempora/Pent13-0:Lectio7` – include a specific section from the target file.
- `@Tempora/Quad5-0::1-3` – include a range of lines (1‑3) from the referenced file.
- Chained modifiers may appear, e.g. `@Tempora/Quad5-0::1 s/7-13/6-15/` meaning “take lines 1 of Quad5-0 then apply the substitution shown.”

The legacy engine also permits `@:` pointing to special virtual sections (`@:Confiteor_`). Our parser must resolve these references recursively and guard against circular includes.

## Substitutions & Conditionals

- Text commands such as `s/old/new/` (with optional `g` or regex flags) apply after the referenced content is loaded. These usually tweak scripture citations or pronouns for a given season.
- Parenthetical rubrics `(rubrica tridentina)` or `(sed rubrica 1960)` indicate conditional content. We should capture these markers so the renderer can decide whether to display or suppress them based on settings.

## Practical Tips

1. **Identify rank first.** Saints with full propers live in `Sancti`; if a section is missing, follow the `@` to the relevant `Commune` file.
2. **Tempora naming pattern.** `<Season><week>-<day>.txt` where day numbers follow Sunday=0 … Saturday=6. Seasons witnessed in English data include `Adv`, `Nat`, `Epi`, `Quad`, `Pasc`, `Pent`.
3. **Variants are opt-in.** The “M” (Monastic) and “OP” directories duplicate the base structure with the same file names. Decide which variant(s) Vigil will support before extraction.
4. **Cross-language parity.** Latin and English folders share file names, enabling bilingual extraction if we pull the same relative path in both trees.

Keep this sheet handy when implementing the calendar precedence rules and parser resolvers so we always target the correct source material.
