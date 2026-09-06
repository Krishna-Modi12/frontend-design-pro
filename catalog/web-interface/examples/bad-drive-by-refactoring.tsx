/* ANTI-EXAMPLE — study the violations, never imitate.
 *
 * The user asked for ONE thing: "add an error state to the email input."
 * Compare against good-surgical-change.tsx, which delivers exactly that.
 *
 * P3 violations (drive-by refactoring — none of this was requested):
 *   • Reformatted the whole file and switched double quotes to single quotes
 *   • Renamed `value`/`onChange` to `val`/`handleChange` — breaks every call site
 *   • Deleted `formatLabel`, pre-existing code this change did not orphan
 * P2 violations (speculative complexity):
 *   • Invented `variant` and `size` props nobody asked for
 *   • useMemo around a string comparison, with no re-render problem to solve
 *   • useEffect mirroring a prop into state that could be derived during render
 *   • try/catch around JSX that cannot throw
 * P1 violation: assumed the error copy and shipped it silently instead of asking.
 * BEHAV-05/06 violations: shipped TODO/FIXME markers and speculative comments.
 */
import * as React from 'react'

type BadEmailFieldProps = {
  val: string
  handleChange: (v: string) => void
  error?: string
  variant?: 'default' | 'ghost' | 'outline'   // ✗ P2 — never requested
  size?: 'sm' | 'md' | 'lg'                   // ✗ P2 — never requested
}

export function BadEmailField({ val, handleChange, error, variant = 'default', size = 'md' }: BadEmailFieldProps) {
  // ✗ P2 — useEffect mirroring a prop into state; derive during render instead
  const [internal, setInternal] = React.useState(val)
  React.useEffect(() => { setInternal(val) }, [val])

  // ✗ P2 — memoizing a string comparison solves no measured problem
  const hasError = React.useMemo(() => Boolean(error && error.length > 0), [error])

  // TODO: extract these into a design system later          // ✗ BEHAV-05 + BEHAV-06
  // FIXME: variant styling is incomplete for ghost           // ✗ BEHAV-05
  // this could be useful when we add multi-locale support    // ✗ BEHAV-06
  const styles = { default: 'border', ghost: 'border-0', outline: 'border-2' }
  const sizes = { sm: 'h-9', md: 'h-11', lg: 'h-12' }

  try {                                        // ✗ P2 — JSX here cannot throw
    return (
      <div className='transition-all'>         {/* ✗ PERF-04 — drive-by style churn */}
        <input
          value={internal}
          onChange={(e) => { setInternal(e.target.value); handleChange(e.target.value) }}
          className={`${styles[variant]} ${sizes[size]}`}
        />
        {hasError && <span className='text-red-500'>{error}</span>}
      </div>
    )
  } catch {
    return null
  }
}
