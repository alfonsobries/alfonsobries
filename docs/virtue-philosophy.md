# Virtue — philosophy

Virtue is a personal system for daily self-improvement. It is built to
measure for one person, evolves by being lived with, and stays open source.
If it ever becomes good enough, it may grow into a standalone app — every
design decision should survive that move, but never wait for it.

## The one law

**Ease of use rules every decision.** Logging is where tracking systems die:
if recording a meal, a workout or a prayer takes effort, it stops happening.
Marking a day must be a tap; richer input (a short text, a photo) must feel
as light. When a trade-off appears between a smarter feature and a lighter
one, the lighter one wins.

## Three areas

Progress is measured across **body**, **mind** and **spirit**. The areas are
fixed; what fills them is personal. Spirit can mean daily prayers for one
person and meditation for another; body can mean a diet, a training plan or
both. The system never hardcodes meaning into an area — habits do.

## Habits are pluggable

Each habit is its own small system with its own rules:

- A binary daily mark ("did I draw today?").
- A measured amount, where more counts for more (10 vs 50 minutes of reading).
- A weekly or goal-based target instead of a daily one (strength sessions per
  week).
- An external evaluator (a food log that judges the day against a carb and
  calorie goal).

However a habit works inside, it talks to the core through one **contract**:
it emits weighted points into one or more areas. The core never knows about
food photos or workout minutes — only about points arriving at body, mind or
spirit. That boundary is what lets a habit get smarter, change its rules or
be replaced without reshaping anything else, and is what would someday allow
habits to be installed and configured like small apps of their own.

## Hardcoded first

Habits are built concretely for their one real user, hardcoded where that is
simpler — generality is never a reason to complicate today's version. The
contract boundary is the only thing kept clean at all times, because it is
what keeps the future open.

## Presentation sits on top of the engine

The engine is stable: points, checkpoints, floors. How progress is _shown_ —
a scene that builds, area meters, streak counters — sits on top and can change
without touching the rules. Visual themes are interchangeable; art never leaks
into the engine.

## Calibrated to habit science

Progression pace is not arbitrary. An area's full journey is calibrated to
what behavior research says about forming a virtue or breaking a vice:
roughly 90 days of solid practice (the ~66-day average to automate a habit,
the ~90-day standard in recovery). When tuning points or stage thresholds,
validate the curve against the realistic daily maximum — a day actually
lived well, not the theoretical best — and keep the final stage reachable in
about 90 such days. A test must assert this, so retuning can never silently
make the journey unreachable or trivially fast.

## Progress is kind

A lapse is a setback, never a restart. Crossing a checkpoint sets a floor the
points can never fall below again. Meters may sag when a day is missed, but
nothing built is ever torn down, and the system never shames — tomorrow is a
new day.
