# UX Writing

Source: pbakaus/impeccable (ux-writing reference)

## Core Principle

Make every word earn its place. If the heading explains something, don't repeat it in body text. If a button label is clear, skip additional explanation. Say it once, say it well.

---

## Button Labels

**Rule: Specific verb + object — never generic labels.**

Generic labels ("OK", "Submit", "Yes", "No") are ambiguous. Users shouldn't have to read context to understand what a button does.

| Anti-Pattern | Better | Why |
|---|---|---|
| OK | Save changes | Clarifies outcome |
| Submit | Create account | Action-oriented |
| Yes | Delete message | Confirms specific action |
| Cancel | Keep editing | Explains what happens |
| Click here | Download PDF | Names destination |
| Remove | Delete | "Delete" = permanent; "Remove" = recoverable |

**For destructive actions:** Include quantity — "Delete 5 items" beats "Delete selected"

**For confirmation dialogs:** Use "Delete project" / "Keep project" — never "Yes" / "No"

---

## Error Messages — The 3-Part Formula

Structure every error as: **What went wrong? → Why? → How to fix it?**

Example: "Email address needs an @ symbol" — not "Invalid input"

### Error Message Templates

| Error Type | Template |
|---|---|
| Format error | "[Field] needs to be [format]. Example: [example]" |
| Missing data | "Please enter [what's missing]" |
| Access denied | "You don't have access to [thing]. [Alternative action]" |
| Network error | "We couldn't reach [thing]. Check your connection and [action]" |
| Server error | "Something went wrong on our end. We're looking into it. [Alternative action]" |

**Never blame the user:**
- ❌ "You entered an invalid date"
- ✅ "Please enter a date in MM/DD/YYYY format"

**Never use generic messages:**
- ❌ "Something went wrong"
- ✅ "We couldn't save your changes. Please check your connection and try again."

**Never inject humor into error states** — frustrated users need help, not levity.

---

## Empty States

Structure: **Brief acknowledgment → Value proposition → Single action**

| Anti-Pattern | Better |
|---|---|
| "No items" | "No projects yet. Create your first one to get started." |
| "Nothing here" | "Your inbox is empty. Messages from your team will appear here." |
| Blank space | Illustration or icon + headline + subtext + CTA |

Empty states are opportunities to teach the interface, not dead ends.

---

## Voice vs. Tone

**Voice** = consistent brand personality (always the same)  
**Tone** = contextual adaptation to the moment (changes per situation)

| Context | Tone Approach |
|---|---|
| Success | Brief, celebratory: "Done! Your changes are live." |
| Error | Empathetic, solutions-focused: "That didn't work. Here's what to try..." |
| Processing | Reassuring: "Saving your work..." |
| Destructive confirm | Serious, consequences-clear: "Delete this project? This can't be undone." |
| Onboarding | Warm, directive: "Let's get your first project set up." |
| Loading (long) | Set expectations: "This usually takes about 30 seconds." |

---

## Loading States

Be specific about what's happening — never generic:
- ❌ "Loading..."
- ✅ "Saving your draft..."
- ✅ "Generating your report..."
- ✅ "Uploading 3 files..."

For extended waits: either set expectations ("This usually takes 30 seconds") or show a progress indicator.

---

## Confirmation Dialogs

Philosophy: **Undo is almost always better than confirmation dialogs.** Users click through confirmations mindlessly. Design for undo first; use confirmation only for:
- Truly irreversible actions (account deletion)
- High-cost or batch operations with no recovery

When confirmation IS necessary:
- Name the specific action
- Explain consequences
- Use precise button labels (not Yes/No)

---

## Terminology Consistency

Scattered terminology creates cognitive friction. Pick one word per concept and enforce it:

| Scattered | Unified |
|---|---|
| Delete / Remove / Trash | Delete |
| Settings / Preferences / Options | Settings |
| Sign in / Log in / Enter | Sign in |
| Create / Add / New | Create |
| Account / Profile / User | Account |

Create a terminology glossary and enforce it across the entire product.

---

## Writing for Accessibility

**Link text:** Must function independently out of context.
- ❌ "Click here" / "Read more" / "Learn more"
- ✅ "View pricing plans" / "Read the typography guide"

**Image alt text:** Convey information, not image type.
- ❌ `alt="Chart"` / `alt="Graph image"`
- ✅ `alt="Revenue increased 40% in Q4"` / `alt="Team photo at company offsite"`
- Purely decorative: `alt=""` (empty string, not missing)

**Icon buttons:** Must have `aria-label` — never skip this.

---

## Writing for Translation

Design for expansion. Other languages take MORE space:

| Language | Typical Expansion |
|---|---|
| German | +30% |
| French | +20% |
| Finnish | +30–40% |
| Chinese | −30% (character density differs) |

**Translation-friendly patterns:**
- Separate numbers from text: "New messages: 3" not "You have 3 new messages"
- Use complete sentences as atomic strings (word order varies across languages)
- Avoid abbreviations: "5 minutes ago" not "5 mins ago"
- Provide translators with UI context about where strings appear
- Never concatenate strings: don't build "Show {count} {itemType}" dynamically

---

## Form Instructions

- **Placeholders are not labels** — placeholders disappear on focus; always use visible `<label>` elements
- Show format via placeholder example: `placeholder="MM/DD/YYYY"` (not "Enter date")
- For ambiguous fields, explain why you're asking: "Phone number (for SMS delivery updates)"
- Validate on blur, not on every keystroke (except password strength)
- Position error messages below the field, connected via `aria-describedby`

---

## The "Redundant Copy" Rule

If the heading explains something, don't repeat it in body text. If a button label is clear, skip descriptive text around it. Audit every string against: "Does this add new information or just restate what's already visible?"

---

## Anti-Pattern Summary

| Anti-Pattern | Fix |
|---|---|
| Generic button labels ("OK", "Submit") | Verb + object ("Save changes", "Create account") |
| User-blame error language | Instructive framing ("Please enter..." not "You entered...") |
| Vague error messages ("Something went wrong") | Specific + actionable ("We couldn't reach the server. Try again.") |
| Empty state = blank space | Brief ack + value prop + CTA |
| Humor in error states | Empathy + solution |
| Terminology variation ("delete/remove/trash") | One word per concept, enforced |
| Generic loading ("Loading...") | Specific ("Saving your draft...") |
| Link text out of context ("Click here") | Self-contained ("Download the guide") |
| Missing alt text or `alt="image"` | Descriptive or `alt=""` for decorative |
| Confirmation dialogs for recoverable actions | Undo pattern instead |
| Jargon without explanation | Plain language |
| Passive voice ("Mistakes were made") | Active voice ("We couldn't save your changes") |
