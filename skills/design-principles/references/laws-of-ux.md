# Laws of UX — Applied to Frontend Decisions

Source: lawsofux.com (Jon Yablonski, CC BY-NC-ND 4.0). Not a reading list — each law below is stated as a decision rule with the interface consequence that follows from it.

## Cognition & memory

| Law | Statement | What it forces in the UI |
|---|---|---|
| **Miller's Law** | Working memory holds ~7±2 items | Nav ≤7 top-level items · chunk phone/card numbers · group form fields into ≤7 per fieldset |
| **Working Memory** | Temporary store, easily disrupted | Never make a user carry a value across screens — show the order total on the payment step, don't ask them to remember it |
| **Cognitive Load** | Mental resources needed to use the UI | Every decorative element spends budget. Remove anything not carrying meaning before adding anything new |
| **Chunking** | Grouping makes information retainable | Break long forms into steps; group related settings under headings; segment tables with subheads |
| **Hick's Law** | Decision time grows with number/complexity of choices | Progressive disclosure over a 20-option menu; a recommended default over an empty picker |
| **Choice Overload** | Too many options paralyse | 3 pricing tiers, not 6. Filter presets before raw facets |
| **Tesler's Law** | Every system has irreducible complexity — someone absorbs it | Absorb it in the code, not the user's head. Smart defaults, inferred values, format-on-blur |
| **Occam's Razor** | Fewest assumptions wins | When two layouts test equal, ship the one with fewer elements |

## Attention & memory of the experience

| Law | Statement | What it forces in the UI |
|---|---|---|
| **Von Restorff (Isolation)** | The different item is remembered | Exactly one primary CTA per view. If everything is emphasised, nothing is |
| **Serial Position Effect** | First and last items are best recalled | Put the most important nav items at the ends; bury the mundane in the middle |
| **Peak-End Rule** | Experience is judged by its peak and its end | Invest in the success state and the error recovery — those are the peaks people carry |
| **Zeigarnik Effect** | Interrupted tasks are remembered | Progress indicators and saved drafts create productive tension; use for onboarding completion |
| **Selective Attention** | Users filter to goal-relevant stimuli | Banner blindness is real — never put critical info in something that looks like an ad |
| **Goal-Gradient Effect** | Motivation rises near the goal | Show endowed progress ("Step 2 of 4", pre-filled first step) to pull users forward |

## Interaction & speed

| Law | Statement | What it forces in the UI |
|---|---|---|
| **Fitts's Law** | Acquisition time ∝ distance ÷ target size | ≥44×44px targets · primary actions near the thumb on mobile · screen edges are infinitely large targets |
| **Doherty Threshold** | Productivity soars under ~400ms response | Optimistic UI and skeletons exist to stay under this. Above 1s, show progress; above 10s, allow backgrounding |
| **Flow** | Immersion requires uninterrupted focus | No unprompted modals, no layout shift, no focus theft |
| **Postel's Law** | Liberal in what you accept, conservative in what you send | Accept "(555) 123-4567", " 555 1234567 " and normalise. Never reject a phone number for formatting |
| **Paradox of the Active User** | Nobody reads the manual | The interface must teach itself in place. Empty states are the documentation |

## Perception (Gestalt)

| Law | Statement | What it forces in the UI |
|---|---|---|
| **Law of Proximity** | Near things are perceived as grouped | Spacing *is* grouping. A label 4px from its input and 24px from the next field needs no border |
| **Law of Similarity** | Similar things are perceived as related | Same visual weight ⇒ same importance. Don't style a destructive action like a neutral one |
| **Law of Common Region** | A shared boundary creates a group | A card is a claim about relatedness — don't box unrelated things together |
| **Law of Uniform Connectedness** | Connected elements read as most related | Connect steps with a line before you number them |
| **Law of Prägnanz** | Ambiguity resolves to the simplest form | Complex icons read as noise at 16px. Simplify until it survives the smallest size you ship |

## Expectation & aesthetics

| Law | Statement | What it forces in the UI |
|---|---|---|
| **Jakob's Law** | Users spend most of their time on *other* sites | Put the logo top-left linking home, search top-right, cart with a badge. Novelty in navigation is a tax, not a feature |
| **Aesthetic-Usability Effect** | Attractive interfaces are *perceived* as more usable | Polish buys tolerance for minor friction — and it masks real usability problems in testing. Never let it substitute for a task-based test |
| **Mental Model** | Users arrive with a model of how it works | Match the model or teach the difference explicitly; never silently violate it |
| **Pareto Principle** | ~80% of effects from ~20% of causes | Find the 20% of flows carrying 80% of traffic and make those excellent first |
| **Parkinson's Law** | Work expands to fill available time | Show a realistic completion estimate; artificial delay ("verifying…") is dishonest, not reassuring |
| **Cognitive Bias** | Systematic errors of judgement | Beware anchoring in pricing tables and confirmation bias in your own design reviews |

## How to apply in review

Pick the failing law, not a vague adjective. "This nav has 11 items — Miller's Law says chunk to ≤7" beats "this feels cluttered". A law names the mechanism, which makes the fix arguable and testable.
