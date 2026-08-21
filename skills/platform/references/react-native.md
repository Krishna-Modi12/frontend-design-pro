<!-- shortcode: [rn] | package: frontend-design-pro-v10 | version: 10.15.0 -->

# React Native Reference

Source: frontend-design-pro skill (internal)
Version: 10.15.0

React Native with Expo SDK 51+ enables production-quality iOS and Android apps from a single TypeScript codebase. This reference covers Expo Router v3 file-based routing, animation via Reanimated 3, gesture handling via RNGH v2, NativeWind Tailwind styling, and platform-specific patterns essential for shipping polished native apps.

---

## Contents

- [1. Expo Router v3 — File-Based Routing](#1-expo-router-v3--file-based-routing)
- [2. SafeAreaView + useSafeAreaInsets](#2-safeareaview--usesafeareainsets)
- [3. react-native-gesture-handler](#3-react-native-gesture-handler)
- [4. react-native-reanimated](#4-react-native-reanimated)
- [5. Pressable vs TouchableOpacity](#5-pressable-vs-touchableopacity)
- [6. FlatList + SectionList](#6-flatlist--sectionlist)
- [7. Platform-Specific Code](#7-platform-specific-code)
- [8. NativeWind — Tailwind in React Native](#8-nativewind--tailwind-in-react-native)
- [9. expo-image — Lazy Loading + Caching](#9-expo-image--lazy-loading--caching)
- [10. expo-haptics](#10-expo-haptics)
- [11. Status Bar + KeyboardAvoidingView](#11-status-bar--keyboardavoidingview)
- [12. Dark Mode](#12-dark-mode)
- [13. Deep Links with Expo Router](#13-deep-links-with-expo-router)
- [14. 44pt Touch Targets](#14-44pt-touch-targets)
- [15. Anti-Patterns](#15-anti-patterns)

---

## 1. Expo Router v3 — File-Based Routing

The `app/` directory mirrors Next.js App Router conventions. Every file in `app/` is a route; `_layout.tsx` files define navigation shells.

```
app/
├── _layout.tsx          ← Root layout (fonts, theme, providers)
├── index.tsx            ← "/" — home screen
├── (tabs)/              ← Route group — shares one bottom tab bar
│   ├── _layout.tsx      ← Tab navigator config
│   ├── index.tsx        ← Tab 1
│   ├── explore.tsx      ← Tab 2
│   └── profile.tsx      ← Tab 3
├── (auth)/              ← Auth group — unauthenticated screens
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── modal.tsx            ← Presented as modal (configured in _layout)
├── [id].tsx             ← Dynamic segment — params.id
├── [...rest].tsx        ← Catch-all — deep link fallback
└── +native-intent.tsx   ← URL transform before routing
```

**Root layout with Stack:**

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Details" }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

**Tab layout:**

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Home, Compass, User } from "lucide-react-native";
import { useColorScheme } from "react-native";

export default function TabsLayout() {
  const scheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: scheme === "dark" ? "#71717a" : "#a1a1aa",
        tabBarStyle: {
          backgroundColor: scheme === "dark" ? "#09090b" : "#fff",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Compass color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
```

**Navigation with `Link` and `useRouter`:**

```tsx
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { Pressable, Text } from "react-native";

// Declarative — Link renders as a touchable element
<Link href="/modal" asChild>
  <Pressable hitSlop={8}>
    <Text>Open modal</Text>
  </Pressable>
</Link>

// Typed link with dynamic params
<Link href={{ pathname: "/[id]", params: { id: post.id } }}>
  Read more
</Link>

// Programmatic navigation
export function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    await performLogin();
    router.replace("/(tabs)"); // replace prevents back to login
  };

  return (
    <Pressable onPress={handleLogin}>
      <Text>Log in</Text>
    </Pressable>
  );
}

// Read dynamic params in the route file
function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostView postId={id} />;
}
```

---

## 2. SafeAreaView + useSafeAreaInsets

Install: `npx expo install react-native-safe-area-context`

Place `SafeAreaProvider` at the app root (inside `_layout.tsx`). Then use `SafeAreaView` for simple screens or `useSafeAreaInsets` for granular control.

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

// Simple full-screen usage — applies all four edge insets
export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text>Content safe from notches and home bars</Text>
    </SafeAreaView>
  );
}

// Selective edges — skip bottom if tab bar already handles it
<SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
  {children}
</SafeAreaView>
```

**`useSafeAreaInsets` for fixed bars and custom layouts:**

```tsx
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Pressable, Text, StyleSheet } from "react-native";

export function BottomActionBar({ onPress }: { onPress: () => void }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(bottom, 16) }, // at least 16px even with no inset
      ]}
    >
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.label}>Confirm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
```

---

## 3. react-native-gesture-handler

Install: `npx expo install react-native-gesture-handler`

Wrap your root in `GestureHandlerRootView` (see layout example in Section 1).

```tsx
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

// Pan gesture — drag a card, snap back on release
export function DraggableCard() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((e) => {
      offsetX.value += e.changeX;
      offsetY.value += e.changeY;
    })
    .onEnd(() => {
      offsetX.value = withSpring(0);
      offsetY.value = withSpring(0);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animStyle]}>
        <Text>Drag me</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// Tap gesture with scale feedback + JS-thread callback
export function TapCard({ onTap }: { onTap: () => void }) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.95); })
    .onFinalize(() => {
      scale.value = withSpring(1);
      runOnJS(onTap)(); // bridge from UI thread → JS thread
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.card, animStyle]}>
        <Text>Tap me</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// Composing gestures
const pan = Gesture.Pan();
const pinch = Gesture.Pinch();

const simultaneous = Gesture.Simultaneous(pan, pinch); // both fire at once
const exclusive = Gesture.Exclusive(longPress, tap);   // first recognized wins
const race = Gesture.Race(horizontalPan, verticalPan); // first to activate cancels others
```

Note: `withNativeDriver` is implicit in RNGH v2+ — all handlers run on the native UI thread by default. There is no flag to pass. Keep animated values driving only `transform` and `opacity` (not width/height/top/left) to stay off the JS thread.

---

## 4. react-native-reanimated

Install: `npx expo install react-native-reanimated` — then add the Babel plugin:

```js
// babel.config.js
module.exports = {
  presets: ["babel-preset-expo"],
  plugins: ["react-native-reanimated/plugin"], // must be last
};
```

**Core API:**

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated";

// Shared value lives on the UI thread — no JS bridge overhead
const opacity = useSharedValue(0);
const translateY = useSharedValue(40);

// Animate in on mount
useEffect(() => {
  opacity.value = withTiming(1, { duration: 300 });
  translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
}, []);

// useAnimatedStyle — recomputed on UI thread, never re-renders the React tree
const animStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{ translateY: translateY.value }],
}));

// Render animated view
<Animated.View style={[styles.card, animStyle]}>
  {children}
</Animated.View>
```

**Spring vs timing — when to use each:**

```tsx
// withSpring — physics-based, feels interactive and alive
// Use for: gesture-driven animations, snapping, interactive elements
withSpring(targetValue, {
  damping: 20,    // Higher = less bounce
  stiffness: 200, // Higher = faster response
  mass: 1,
});

// withTiming — duration-based, predictable
// Use for: UI transitions, fades, loading states
withTiming(targetValue, {
  duration: 250,
  easing: Easing.out(Easing.cubic),
});
```

**Sequencing and interpolation:**

```tsx
// Sequence — bounce effect
value.value = withSequence(
  withTiming(1.1, { duration: 100 }),
  withSpring(1, { damping: 12 })
);

// Delayed animation — staggered list items
value.value = withDelay(index * 50, withTiming(1, { duration: 300 }));

// Repeating — pulse / loading indicator
value.value = withRepeat(
  withTiming(1.05, { duration: 800 }),
  -1,   // infinite
  true  // reverse
);

// Interpolate — map a scroll value to visual properties
const headerScale = useAnimatedStyle(() => ({
  transform: [
    {
      scale: interpolate(
        scrollY.value,
        [0, 150],           // input range
        [1, 0.85],          // output range
        Extrapolation.CLAMP // don't go outside output range
      ),
    },
  ],
}));
```

**`runOnJS` — calling JS functions from a worklet:**

```tsx
// Worklets (gesture callbacks, useAnimatedStyle) run on the UI thread.
// Call router, setState, or any JS-only API via runOnJS.

const navigateBack = () => router.back(); // JS-thread function

const swipe = Gesture.Pan().onEnd((e) => {
  if (e.velocityX > 600) {
    runOnJS(navigateBack)();
  }
});
```

**`useAnimatedGestureHandler` (legacy RNGH v1 — avoid in new code):**

```tsx
// Only use if constrained to react-native-gesture-handler < 2.0
import { PanGestureHandler } from "react-native-gesture-handler";
import { useAnimatedGestureHandler } from "react-native-reanimated";

const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
  onStart: (_, ctx) => { ctx.startX = translateX.value; },
  onActive: (event, ctx) => { translateX.value = ctx.startX + event.translationX; },
  onEnd: () => { translateX.value = withSpring(0); },
});
```

---

## 5. Pressable vs TouchableOpacity

**Always use `Pressable` for new code.** `TouchableOpacity` is a legacy component that only supports opacity feedback and conflicts with RNGH v2.

| Feature | `Pressable` | `TouchableOpacity` |
|---|---|---|
| Style callback | `({ pressed }) => style` | No |
| Android ripple | `android_ripple` prop | No |
| Gesture compatibility | Full RNGH v2 support | Conflicts with GestureDetector |
| `hitSlop` | Yes | Yes |
| Use when | All new code | Legacy codebase maintenance only |

```tsx
import { Pressable, Text, StyleSheet } from "react-native";

// Children-as-function — access pressed state anywhere in subtree
export function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: false }}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <Text style={[styles.label, pressed && { opacity: 0.85 }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: "#2563eb",
    transform: [{ scale: 0.97 }],
  },
  label: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
```

**Icon button with circular Android ripple:**

```tsx
<Pressable
  onPress={onClose}
  hitSlop={12}
  android_ripple={{ color: "#e4e4e7", borderless: true, radius: 24 }}
  style={styles.iconBtn}
  accessibilityRole="button"
  accessibilityLabel="Close"
>
  <XIcon size={20} />
</Pressable>
```

---

## 6. FlatList + SectionList

```tsx
import {
  FlatList,
  SectionList,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const ITEM_HEIGHT = 72;

// FlatList — flat homogeneous list
export function PostList({
  posts,
  onEndReached,
  isLoading,
}: {
  posts: Post[];
  onEndReached: () => void;
  isLoading: boolean;
}) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}           // unique string — never skip this
      renderItem={({ item }) => <PostRow post={item} />}
      // Pagination
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}               // fire at 50% from bottom
      // Slot components
      ListEmptyComponent={<EmptyState />}
      ListFooterComponent={
        isLoading ? <ActivityIndicator style={{ padding: 16 }} /> : null
      }
      ListHeaderComponent={<Header />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      // Performance — critical for long lists
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews             // detach off-screen views (Android)
      getItemLayout={(_, index) => ({   // enables scrollToIndex + avoids measurement
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
}

// SectionList — grouped / sectioned content
interface Section { title: string; data: Post[] }

export function GroupedPostList({ sections }: { sections: Section[] }) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostRow post={item} />}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      stickySectionHeadersEnabled
      ListEmptyComponent={<EmptyState />}
    />
  );
}

const styles = StyleSheet.create({
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#e4e4e7" },
  sectionHeader: {
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
```

---

## 7. Platform-Specific Code

```tsx
import { Platform, StyleSheet } from "react-native";

// Runtime OS check
if (Platform.OS === "ios") { /* iOS only */ }
if (Platform.OS === "android") { /* Android only */ }
if (Platform.OS === "web") { /* Expo Web */ }

// Version check
if (Platform.OS === "android" && Platform.Version >= 31) {
  // Android 12+ — can use Material You dynamic colors
}

// Platform.select — clean inline branching
const cardStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    ...cardStyle,
  },
  headerText: {
    fontFamily: Platform.select({
      ios: "System",          // San Francisco
      android: "Roboto",
      default: "sans-serif",
    }),
    fontSize: 17,
    fontWeight: "600",
  },
});
```

**File-extension-based splitting — React Native resolves automatically:**

```
Button.ios.tsx      ← imported only on iOS
Button.android.tsx  ← imported only on Android
Button.tsx          ← fallback (web, tests, unknown)
```

```tsx
// Button.ios.tsx — SF-style rounded rect
export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.iosBtn} onPress={onPress}>
      <Text style={styles.iosLabel}>{label}</Text>
    </Pressable>
  );
}

// Button.android.tsx — filled with ripple
export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable
      style={styles.materialBtn}
      android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      onPress={onPress}
    >
      <Text style={styles.materialLabel}>{label}</Text>
    </Pressable>
  );
}
```

---

## 8. NativeWind — Tailwind in React Native

Install: `npx expo install nativewind tailwindcss` — configure Babel and Tailwind config.

```js
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
};

// babel.config.js
module.exports = {
  presets: ["babel-preset-expo"],
  plugins: ["nativewind/babel", "react-native-reanimated/plugin"],
};
```

```tsx
// NativeWind v4 — className on any RN primitive
import { View, Text, Pressable } from "react-native";

export function Card({ title, body }: { title: string; body: string }) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm mx-4 my-2">
      <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </Text>
      <Text className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {body}
      </Text>
      <Pressable className="mt-3 bg-blue-600 rounded-xl py-3 items-center active:bg-blue-700">
        <Text className="text-white font-semibold text-sm">View Details</Text>
      </Pressable>
    </View>
  );
}

// Dark mode is automatic — reads from useColorScheme() under the hood
// Supports: dark:, active:, focus:, disabled:, responsive (sm: md:), arbitrary (w-[220px])
export function Badge({ label }: { label: string }) {
  return (
    <View className="bg-blue-100 dark:bg-blue-900/40 rounded-full px-3 py-1 self-start">
      <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
        {label}
      </Text>
    </View>
  );
}
```

---

## 9. expo-image — Lazy Loading + Caching

Install: `npx expo install expo-image`

`expo-image` outperforms React Native's built-in `Image` in every metric: blurhash placeholders, configurable memory/disk caching, priority hints, and recycling for FlatList performance.

```tsx
import { Image } from "expo-image";

// Basic — blurhash placeholder fades to real image
<Image
  source={{ uri: "https://example.com/photo.jpg" }}
  placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
  contentFit="cover"          // "cover" | "contain" | "fill" | "none" | "scale-down"
  contentPosition="center"
  transition={300}            // cross-fade duration in ms
  style={{ width: "100%", height: 200, borderRadius: 12 }}
/>

// Priority — set "high" for above-fold, default is "normal"
<Image
  source={require("../assets/hero.jpg")}
  priority="high"
  contentFit="contain"
  style={{ width: 80, height: 80 }}
/>

// In FlatList — provide recyclingKey to reuse native views without flash
<Image
  source={{ uri: item.imageUrl }}
  style={{ width: 120, height: 120 }}
  contentFit="cover"
  recyclingKey={item.id}
  cachePolicy="memory-disk"   // "none" | "disk" | "memory" | "memory-disk"
/>

// Prefetch images before they scroll into view
import { Image as ExpoImage } from "expo-image";
await ExpoImage.prefetch([url1, url2, url3]);

// Clear caches on logout
await ExpoImage.clearMemoryCache();
await ExpoImage.clearDiskCache();
```

---

## 10. expo-haptics

Install: `npx expo install expo-haptics`

Use haptics to give tactile confirmation to user actions. Overuse creates fatigue — reserve for meaningful moments.

```tsx
import * as Haptics from "expo-haptics";

// Impact — for button presses, selections, drag events
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // subtle tap
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  // standard
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);   // strong action

// Notification — for outcomes
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Selection — for pickers, steppers, sliders
await Haptics.selectionAsync();

// Triggering haptics from inside a gesture worklet — use runOnJS
const triggerHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

const pan = Gesture.Pan().onUpdate((e) => {
  if (Math.abs(e.translationX) > 80 && !snapped.value) {
    snapped.value = true;
    runOnJS(triggerHaptic)();
  }
});
```

---

## 11. Status Bar + KeyboardAvoidingView

**Status bar via `expo-status-bar`:**

```tsx
import { StatusBar } from "expo-status-bar";

// Place in root layout or per-screen
<StatusBar style="auto" />    // adapts to light/dark
<StatusBar style="light" />   // white icons — for dark backgrounds
<StatusBar style="dark" />    // black icons — for light backgrounds

// Translucent: content renders behind status bar
// Pair with SafeAreaView edges={["top"]} to offset content
<StatusBar style="light" translucent backgroundColor="transparent" />
```

**`KeyboardAvoidingView`:**

```tsx
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

export function LoginForm() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // "padding" — adds paddingBottom equal to keyboard height (iOS)
      // "height"  — shrinks the view (Android, usually sufficient)
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled" // tapping outside input dismisses keyboard
      >
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          returnKeyType="done"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16, // must be ≥16 to prevent iOS auto-zoom on focus
  },
});
```

---

## 12. Dark Mode

```tsx
import { Appearance, useColorScheme } from "react-native";

// Imperative read — useful outside React components
const scheme = Appearance.getColorScheme(); // "light" | "dark" | null

// Hook — re-renders component when system scheme changes
function ThemedText({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Text style={{ color: isDark ? "#fafafa" : "#09090b" }}>{children}</Text>
  );
}

// Listen to scheme changes in a context provider
useEffect(() => {
  const sub = Appearance.addChangeListener(({ colorScheme }) => {
    setTheme(colorScheme ?? "light");
  });
  return () => sub.remove();
}, []);

// Override system scheme — e.g., in-app theme toggle
Appearance.setColorScheme("dark");
Appearance.setColorScheme("light");
Appearance.setColorScheme(null); // follow system again
```

**Design token pattern — define once, use everywhere:**

```tsx
const Colors = {
  light: {
    background: "#ffffff",
    surface: "#f4f4f5",
    text: "#09090b",
    textMuted: "#71717a",
    border: "#e4e4e7",
    primary: "#3b82f6",
  },
  dark: {
    background: "#09090b",
    surface: "#18181b",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    border: "#27272a",
    primary: "#60a5fa",
  },
};

export function useTheme() {
  const scheme = useColorScheme() ?? "light";
  return Colors[scheme];
}
```

**`DynamicColorIOS` — iOS-native adaptive color (avoids re-render on scheme change):**

```tsx
import { DynamicColorIOS, Platform, StyleSheet } from "react-native";

const adaptiveBackground = Platform.OS === "ios"
  ? DynamicColorIOS({ light: "#ffffff", dark: "#1c1c1e" })
  : undefined; // use useTheme() on Android

const styles = StyleSheet.create({
  card: {
    backgroundColor: adaptiveBackground ?? "#ffffff",
  },
});
```

---

## 13. Deep Links with Expo Router

Expo Router handles deep linking automatically — no manual `Linking` configuration needed for standard routes.

```json
// app.json — configure your URL scheme
{
  "expo": {
    "scheme": "myapp",
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "autoVerify": true,
        "data": [{ "scheme": "https", "host": "myapp.com" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    },
    "ios": {
      "associatedDomains": ["applinks:myapp.com"]
    }
  }
}
```

**Automatic route mapping:**

```
myapp://product/abc123      → app/product/[id].tsx  (params.id = "abc123")
https://myapp.com/about     → app/about.tsx
myapp://settings/privacy    → app/settings/privacy.tsx
```

**`+native-intent.tsx` — transform incoming URLs before routing:**

```tsx
// app/+native-intent.tsx
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  // Redirect legacy URL scheme to current routes
  if (path.startsWith("/v1/items/")) {
    return path.replace("/v1/items/", "/product/");
  }
  // Redirect unrecognized paths to 404
  return path;
}
```

**Catch-all route for unmatched deep links:**

```tsx
// app/[...rest].tsx
import { useLocalSearchParams, Link } from "expo-router";
import { View, Text } from "react-native";

export default function NotFound() {
  const { rest } = useLocalSearchParams<{ rest: string[] }>();
  const path = Array.isArray(rest) ? rest.join("/") : rest;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
        Page not found
      </Text>
      <Text style={{ color: "#71717a", marginBottom: 24 }}>/{path}</Text>
      <Link href="/">
        <Text style={{ color: "#3b82f6", fontWeight: "600" }}>Go home</Text>
      </Link>
    </View>
  );
}
```

---

## 14. 44pt Touch Targets

Apple HIG requires minimum 44×44pt touch targets. Use `hitSlop` to expand the touch area without changing visual size.

```tsx
import { Pressable, StyleSheet } from "react-native";

// Icon button — visually 24pt, touch area 48pt
export function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <XIcon size={24} color="#71717a" />
    </Pressable>
  );
}

// Shorthand — equal insets on all sides
<Pressable hitSlop={12} onPress={onPress}>
  <ChevronRight size={16} />
</Pressable>

// List rows — min height enforces target size without hitSlop
const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconButton: {
    // Visual size 24pt — hitSlop extends touch area to 48pt
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

---

## 15. Anti-Patterns

**Using `TouchableOpacity` for complex gestures.** It conflicts with `GestureDetector` and causes gesture cancellation. Use `Pressable`.

```tsx
// WRONG
<GestureDetector gesture={pan}>
  <TouchableOpacity onPress={onPress}>
    <Text>Drag or tap</Text>
  </TouchableOpacity>
</GestureDetector>

// RIGHT
<GestureDetector gesture={pan}>
  <Pressable onPress={onPress}>
    <Text>Drag or tap</Text>
  </Pressable>
</GestureDetector>
```

**Missing `keyExtractor` on FlatList / SectionList.** React Native falls back to array index — reorders and deletes will corrupt item identity.

```tsx
// WRONG
<FlatList data={items} renderItem={renderItem} />

// RIGHT
<FlatList data={items} keyExtractor={(item) => item.id} renderItem={renderItem} />
```

**Hardcoded colors that break dark mode.**

```tsx
// WRONG
<Text style={{ color: "#000000", backgroundColor: "#ffffff" }}>Hello</Text>

// RIGHT — use tokens or NativeWind dark: variants
const theme = useTheme();
<Text style={{ color: theme.text, backgroundColor: theme.background }}>Hello</Text>
// or
<Text className="text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900">Hello</Text>
```

**No `hitSlop` on small interactive elements.**

```tsx
// WRONG — 20pt icon has 20pt tap area, frequently mis-tapped
<Pressable onPress={onClose} style={{ width: 20, height: 20 }}>
  <XIcon size={20} />
</Pressable>

// RIGHT — 44pt tap area
<Pressable onPress={onClose} hitSlop={12} style={{ width: 20, height: 20 }}>
  <XIcon size={20} />
</Pressable>
```

**Driving layout properties (width, height, top) with Reanimated.** These run on the JS thread and drop frames. Only drive `transform` and `opacity` from worklets.

```tsx
// WRONG — width runs on JS thread, causes jank
const width = useSharedValue(100);
const style = useAnimatedStyle(() => ({ width: width.value }));

// RIGHT — scaleX is compositor-friendly, zero JS overhead
const scaleX = useSharedValue(1);
const style = useAnimatedStyle(() => ({
  transform: [{ scaleX: scaleX.value }],
}));
```

**Missing `behavior` on `KeyboardAvoidingView`.** Without it, the prop does nothing on iOS.

```tsx
// WRONG — keyboard covers inputs on iOS
<KeyboardAvoidingView style={{ flex: 1 }}>
  <TextInput />
</KeyboardAvoidingView>

// RIGHT
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
  <TextInput />
</KeyboardAvoidingView>
```

**Calling router or setState directly inside a Reanimated worklet.**

```tsx
// WRONG — router.push is JS-only, crashes inside worklet
const pan = Gesture.Pan().onEnd(() => {
  router.push("/success");
});

// RIGHT
const goToSuccess = useCallback(() => router.push("/success"), []);
const pan = Gesture.Pan().onEnd(() => {
  runOnJS(goToSuccess)();
});
```

---

> Related: `/sessions/beautiful-cool-archimedes/frontend-design-pro-v10/references/mobile-patterns.md` — web mobile patterns (vaul, Framer Motion, PWA) for cross-platform teams.
