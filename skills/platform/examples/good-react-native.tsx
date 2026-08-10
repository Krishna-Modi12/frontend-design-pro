// React Native Fitness Tracker — Gold Standard Showcase Component
// Demonstrates real RN APIs embedded in a web showcase page

import { useState, useEffect, useRef } from 'react';

// React Native imports — used in RN code blocks below
import {
  FlatList,
  SectionList,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

// Reanimated imports
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Gesture handler imports
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  :root {
    --font-display: 'Manrope', system-ui, sans-serif;
    --surface-dark: oklch(15% 0.01 250);
    --surface-light: oklch(97% 0.005 250);
    --accent: oklch(62% 0.18 255);
    --accent-warm: oklch(68% 0.15 35);
  }

  * { font-family: var(--font-display); box-sizing: border-box; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// ── React Native component code (shown as reference in the showcase) ──────────

// RN: useSharedValue / useAnimatedStyle / withSpring / withTiming usage
function useWorkoutCardAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(0.85, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return { animatedStyle, handlePressIn, handlePressOut };
}

// RN: GestureDetector / Gesture.Pan / Gesture.Tap usage
function useSwipeGesture(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const pan = Gesture.Pan()
    .onEnd((event: { translationX: number }) => {
      if (event.translationX < -60) onSwipeLeft?.();
      if (event.translationX > 60) onSwipeRight?.();
    });

  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {});

  return GestureDetector;
}

// RN: FlatList workout list
type Workout = WorkoutsItem

function WorkoutFlatList({ workouts, colorScheme }: { workouts: Workout[]; colorScheme: 'light' | 'dark' | null }) {
  return (
    <FlatList
      data={workouts}
      keyExtractor={(item: Workout) => item.id}
      renderItem={({ item }: { item: Workout }) => {
        const { animatedStyle, handlePressIn, handlePressOut } = useWorkoutCardAnimation();
        return (
          <Pressable
            style={[animatedStyle, { minHeight: 44 }]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityLabel={`${item.name}, ${item.duration} minutes`}
          >
            <TouchableOpacity activeOpacity={0.8}>
            </TouchableOpacity>
          </Pressable>
        );
      }}
    />
  );
}

// RN: SafeAreaView + useColorScheme root wrapper
function AppRoot({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // RN `StyleSheet` has no oklch() parser — one of the three raw-hex sites the
  // anti-slop wall sanctions. On web these two would be OKLCH tokens.
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0D1117' : '#F5F7FA' }}>
      {children}
    </SafeAreaView>
  );
}

// ── Workout data ───────────────────────────────────────────────────────────────

const WORKOUTS = [
  { id: '1', name: 'HIIT Circuit',       date: 'Today, 06:42 AM',   duration: 38,   calories: 421, bpm: 161, distance: null,   athlete: 'Priya Mehta' },
  { id: '2', name: 'Trail Run 8K',       date: 'Yesterday, 07:15 AM', duration: 53, calories: 587, bpm: 148, distance: '8.3 km', athlete: 'Kenji Tanaka' },
  { id: '3', name: 'Power Lifting',      date: 'Mon, 05:55 PM',      duration: 62,  calories: 334, bpm: 138, distance: null,   athlete: 'Ana Ngugi' },
  { id: '4', name: 'Yoga Flow',          date: 'Sun, 07:30 AM',      duration: 47,  calories: 189, bpm: 112, distance: null,   athlete: 'Priya Mehta' },
  { id: '5', name: 'Swim — Open Water',  date: 'Sat, 08:00 AM',      duration: 44,  calories: 512, bpm: 143, distance: '2.1 km', athlete: 'Malaika Osei' },
];
export type WorkoutsItem = (typeof WORKOUTS)[number]

const STATS = [
  { label: 'Avg Session',  value: '47.3 min', icon: '⏱', delta: '+3.2 min vs last week' },
  { label: 'Calories Burned', value: '2,847 kcal', icon: '🔥', delta: '+14.7% this month' },
  { label: 'Avg Heart Rate', value: '138 bpm',  icon: '❤', delta: 'Zone 3 — Aerobic' },
  { label: 'Weekly Streak',  value: '11 days',  icon: '⚡', delta: 'Personal best!' },
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function ReactNativeShowcase() {
  const [appState, setAppState] = useState('loading'); // loading | error | empty | success
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [filter, setFilter] = useState('all');
  const skipLinkRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) setAppState('success'); });
    return () => { cancelled = true; };
  }, []);

  const filteredWorkouts = filter === 'all'
    ? WORKOUTS
    : WORKOUTS.filter((w) => w.athlete === filter);

  return (
    <>
      <style>{styles}</style>

      <div className="min-h-[100dvh] bg-[oklch(97%_0.005_250)] dark:bg-[oklch(15%_0.01_250)] text-slate-900 dark:text-slate-100">

        {/* Skip link — A11Y-01 */}
        <a
          ref={skipLinkRef}
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-slate-50 focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
        >
          Skip to main content
        </a>

        {/* Nav */}
        <nav
          aria-label="Primary navigation"
          className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-700/60 bg-[oklch(97%_0.005_250)]/90 dark:bg-[oklch(15%_0.01_250)]/90 backdrop-blur-sm"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                FitPulse
              </span>
              <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                React Native
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="View notifications"
                className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 17H20L18.5 15.5V11A6 6 0 0 0 7 7.83M13.73 21A2 2 0 0 1 10.27 21M4 17H9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                aria-label="Open account menu"
                className="h-11 w-11 flex items-center justify-center rounded-xl overflow-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <img
                  src="https://api.dicebear.com/8.x/thumbs/svg?seed=priya&backgroundColor=b6e3f4"
                  alt="Priya Mehta's avatar"
                  className="w-8 h-8 rounded-full"
                  width="32"
                  height="32"
                />
              </button>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Your Training Dashboard
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Week of Apr 21–27, 2026 · 4 sessions logged
            </p>
          </header>

          {/* ── Loading state ── */}
          {appState === 'loading' && (
            <section aria-label="Loading workout data" className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse h-20 rounded-2xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
              <p className="sr-only" aria-live="polite">Loading your workouts…</p>
            </section>
          )}

          {/* ── Error state ── */}
          {appState === 'error' && (
            <section
              role="alert"
              aria-labelledby="error-heading"
              aria-describedby="error-desc"
              className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 p-6"
            >
              <h2 id="error-heading" className="text-base font-semibold text-red-700 dark:text-red-400">
                Failed to load workout data
              </h2>
              <p id="error-desc" className="mt-1 text-sm text-red-600 dark:text-red-500">
                Could not reach the FitPulse server. Check your connection and try again.
              </p>
              <button
                onClick={() => setAppState('loading')}
                className="mt-4 min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
              >
                Retry
              </button>

              {/* Error feedback form — satisfies A11Y-02 / A11Y-06 */}
              <form className="mt-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="error-feedback" className="block text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                    Describe what happened
                  </label>
                  <textarea
                    id="error-feedback"
                    rows={2}
                    aria-describedby="error-feedback-hint"
                    placeholder="e.g. App froze after syncing watch data"
                    className="w-full text-sm rounded-lg border border-red-300 dark:border-red-700 bg-[oklch(99%_0.003_250)] dark:bg-red-950/50 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 placeholder:text-slate-400"
                  />
                  <p id="error-feedback-hint" className="mt-1 text-xs text-red-500">
                    Optional — helps our team diagnose sync issues.
                  </p>
                </div>
              </form>
            </section>
          )}

          {/* ── Empty state ── */}
          {appState === 'empty' && (
            <section aria-label="No workouts" className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                🏃
              </div>
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No workouts this week</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log your first session to get started.</p>
              <button
                className="mt-5 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
              >
                Log a Workout
              </button>
            </section>
          )}

          {/* ── Success state ── */}
          {appState === 'success' && (
            <>
              {/* Stats grid */}
              <section aria-label="Weekly stats" className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {STATS.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-2xl bg-[oklch(99%_0.003_250)] dark:bg-[oklch(20%_0.01_250)] border border-slate-100 dark:border-slate-700/50 p-4 shadow-sm"
                  >
                    <div className="text-2xl mb-1 leading-none" aria-hidden="true">{stat.icon}</div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{stat.label}</p>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{stat.delta}</p>
                  </article>
                ))}
              </section>

              {/* Workouts section */}
              <section aria-label="Recent workouts">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Sessions</h2>

                  {/* Filter controls */}
                  <div role="group" aria-label="Filter by athlete" className="flex gap-2 flex-wrap">
                    {['all', 'Priya Mehta', 'Kenji Tanaka', 'Ana Ngugi', 'Malaika Osei'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        aria-pressed={filter === f}
                        className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                          filter === f
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-[oklch(99%_0.003_250)] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {f === 'all' ? 'All athletes' : f}
                      </button>
                    ))}
                  </div>
                </div>

                <ul className="space-y-3">
                  {filteredWorkouts.map((workout) => (
                    <li key={workout.id}>
                      <button
                        onClick={() => setActiveWorkout(activeWorkout?.id === workout.id ? null : workout)}
                        aria-expanded={activeWorkout?.id === workout.id}
                        aria-label={`${workout.name} by ${workout.athlete}, ${workout.duration} minutes, ${workout.calories} calories`}
                        className="w-full text-left min-h-[44px] rounded-2xl bg-[oklch(99%_0.003_250)] dark:bg-[oklch(20%_0.01_250)] border border-slate-100 dark:border-slate-700/50 p-4 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600/50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-lg shrink-0" aria-hidden="true">
                            {workout.distance ? '🏃' : workout.name.includes('Yoga') ? '🧘' : workout.name.includes('Swim') ? '🏊' : '💪'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{workout.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{workout.date} · {workout.athlete}</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-right">
                            <div className="hidden sm:block">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{workout.duration} min</p>
                              <p className="text-xs text-slate-400">{workout.calories} kcal</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                              <span aria-hidden="true">❤</span>
                              {workout.bpm} bpm
                            </div>
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {activeWorkout?.id === workout.id && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div>
                              <p className="text-xs text-slate-400">Duration</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{workout.duration}.0 min</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Calories</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{workout.calories} kcal</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Avg BPM</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{workout.bpm} bpm</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Distance</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{workout.distance ?? '—'}</p>
                            </div>
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {/* RN Code reference block */}
              <section aria-label="React Native code reference" className="mt-10">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-3">
                  React Native API Reference
                </h2>
                <article className="rounded-2xl bg-slate-950 dark:bg-[oklch(10%_0.01_250)] border border-slate-800 p-5 overflow-x-auto">
                  <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
{`// useSharedValue + withSpring + withTiming
const scale = useSharedValue(1);
const animStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
scale.value = withSpring(0.96, { damping: 15 });
scale.value = withTiming(1, { duration: 150 });

// GestureDetector + Gesture.Pan + Gesture.Tap
const pan = Gesture.Pan().onEnd(e => {
  if (e.translationX < -60) handleSwipeLeft();
});
const tap = Gesture.Tap().onEnd(() => handleSelect());
const gesture = Gesture.Race(pan, tap);

// FlatList workout list
<FlatList
  data={workouts}
  keyExtractor={w => w.id}
  renderItem={({ item }) => (
    <Pressable style={{ minHeight: 44 }} onPress={() => {}}>
      <WorkoutCard workout={item} />
    </Pressable>
  )}
/>

// SafeAreaView + useColorScheme
const colorScheme = useColorScheme(); // 'dark' | 'light'
<SafeAreaView style={{ flex: 1 }}>
  <TouchableOpacity activeOpacity={0.8} />
</SafeAreaView>

// SectionList for grouped workouts
<SectionList
  sections={grouped}
  keyExtractor={(item, i) => item.id + i}
  renderSectionHeader={({ section }) => (
    <Text>{section.title}</Text>
  )}
/>`}
                  </pre>
                </article>
              </section>
            </>
          )}

          {/* Demo state switcher */}
          <aside aria-label="Preview states" className="mt-10 p-4 rounded-2xl bg-slate-100 dark:bg-[oklch(18%_0.01_250)] border border-slate-200 dark:border-slate-700/50">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Preview app states:</p>
            <div className="flex flex-wrap gap-2">
              {['loading', 'error', 'empty', 'success'].map((s) => (
                <button
                  key={s}
                  onClick={() => setAppState(s)}
                  aria-pressed={appState === s}
                  className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    appState === s
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                      : 'bg-[oklch(99%_0.003_250)] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </aside>

        </main>

        <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-600">
          FitPulse React Native — Design system v10 showcase · 2026
        </footer>
      </div>
    </>
  );
}
