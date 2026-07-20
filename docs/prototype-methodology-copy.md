# Methodology & caveats

*This text is inlined in the prototype frontend as a visible section (not a footnote) —
see Step 6. Keep it in sync if either definition changes.*

## Two differently-defined numbers, not one gap

This tool shows two numbers side by side for each state. They are **not measuring the
same thing**, and there is no clean way to convert one into the other — so what follows
is a directional comparison, not a computed compliance gap.

**NEVI's 97% requirement** is a self-reported, time-based uptime formula, set in federal
guidance and submitted by station operators to FHWA via EV-ChART:

> uptime% = (total hours − downtime hours) / total hours × 100, calculated per port,
> with a 97% annual average minimum.

**Paren's reliability rate** is an independently measured, but structurally different,
metric: a proprietary composite built from four *session-level outcomes* — clean
success, success-with-retry, failed attempt, and downtime — not a percentage of clock
time (see Paren's published Appendix B / terminology definitions).

Because one is time-based and the other is outcome-based, a station or state could
plausibly satisfy NEVI's formula while still producing a meaningfully lower Paren rate,
or vice versa — the two aren't in the same unit. Read the comparison as *"NEVI's
self-reported claim, next to what an independently measured, differently-defined metric
suggests,"* not as proof of a specific percentage-point gap.

## Why the confidence label on some states

Not every state's Paren figure was obtained the same way, and the reliability of the
read varies accordingly — states are marked with one of three confidence tiers rather
than presented as uniformly certain:

- **Text-confirmed** — the exact figure is stated directly in the Q2 2026 report's
  prose.
- **Chart-confirmed** — the figure is stamped as an inline label directly on the
  state's own shape in Paren's reliability map.
- **Inferred position** *(MD, DE)* — these states are too small for an inline label, so
  the chart uses a fan-out callout line instead; the figure was obtained by tracing that
  line's exact pixel path back to the shape it touches, with the full set of callout
  lines checked for crossings before assignment. Marked with an asterisk in the table as
  a step removed from a direct on-chart read.

## Source

Paren, *US EV Fast Charging Report, Q2 2026*
(paren.app/reports/us-ev-fast-charging-q2-2026), published 2026-07-14. NEVI formula per
Federal Register NEVI final guidance and driveelectric.gov NEVI Q&A.
