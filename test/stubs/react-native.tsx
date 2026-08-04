// Runtime stub for `react-native`. See ./README.md for why these exist.
//
// React Native has no jsdom renderer — `react-native` resolves to native
// modules, and the real answer for testing it is `react-test-renderer` plus a
// preset this repo does not carry. The gold example exists to demonstrate the
// platform skill's RN conventions, not to be executed in a browser DOM.
//
// So this maps the RN primitives onto DOM elements with their accessibility
// props translated. That is enough for the test to mount the tree and assert
// structure and labels; it is explicitly NOT a claim that the component
// behaves identically on a device.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

// RN styles are objects, not CSS strings. Passing one to a DOM `style` prop
// mostly works (both are camelCase) but numeric values need units; React
// handles that for known properties, so pass through and let it warn if not.
function toDom(props: AnyProps, role?: string): AnyProps {
  const { accessibilityLabel, accessibilityRole, accessibilityState, onPress, testID, ...rest } = props;
  const out: AnyProps = { ...rest };
  if (accessibilityLabel) out['aria-label'] = accessibilityLabel;
  if (testID) out['data-testid'] = testID;
  if (onPress) out.onClick = onPress;
  const resolvedRole = (accessibilityRole as string) ?? role;
  if (resolvedRole) out.role = resolvedRole;
  const state = accessibilityState as { disabled?: boolean; selected?: boolean } | undefined;
  if (state?.disabled) out['aria-disabled'] = true;
  if (state?.selected) out['aria-selected'] = true;
  return out;
}

const make = (tag: string, role?: string) => {
  const C = React.forwardRef<unknown, AnyProps>((props, ref) =>
    React.createElement(tag, { ...toDom(props, role), ref }),
  );
  C.displayName = tag;
  return C;
};

export const View = make('div');
export const Text = make('span');
export const ScrollView = make('div');
export const SafeAreaView = make('div');
export const Image = make('img', 'img');
export const TextInput = make('input');
export const Pressable = make('button', 'button');
export const TouchableOpacity = make('button', 'button');
export const TouchableHighlight = make('button', 'button');
export const Switch = make('input', 'switch');
export const ActivityIndicator = make('div', 'progressbar');

export const FlatList = ({ data, renderItem, ListEmptyComponent, ...rest }: AnyProps) => {
  const items = (data as unknown[]) ?? [];
  const render = renderItem as ((a: { item: unknown; index: number }) => React.ReactNode) | undefined;
  return React.createElement(
    'div',
    toDom(rest, 'list'),
    items.length > 0
      ? items.map((item, index) =>
          React.createElement('div', { key: index, role: 'listitem' }, render?.({ item, index })),
        )
      : (ListEmptyComponent as React.ReactNode) ?? null,
  );
};

export const SectionList = ({ sections, renderItem, renderSectionHeader, ListEmptyComponent, ...rest }: AnyProps) => {
  const groups = (sections as Array<{ data?: unknown[] }>) ?? [];
  const item = renderItem as ((a: { item: unknown; index: number }) => React.ReactNode) | undefined;
  const header = renderSectionHeader as ((a: { section: unknown }) => React.ReactNode) | undefined;
  const empty = groups.every((s) => !s.data?.length);
  return React.createElement(
    'div',
    toDom(rest, 'list'),
    empty
      ? ((ListEmptyComponent as React.ReactNode) ?? null)
      : groups.map((section, s) =>
          React.createElement('div', { key: s, role: 'group' }, [
            header ? React.createElement('div', { key: 'h' }, header({ section })) : null,
            ...(section.data ?? []).map((it, index) =>
              React.createElement('div', { key: index, role: 'listitem' }, item?.({ item: it, index })),
            ),
          ]),
        ),
  );
};

export const StyleSheet = {
  create: <T,>(styles: T): T => styles,
  flatten: (s: unknown) => s,
  absoluteFillObject: {},
  hairlineWidth: 1,
};

export const Platform = { OS: 'ios', select: (o: AnyProps) => o.ios ?? o.default };
export const Dimensions = { get: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }) };
export const useColorScheme = () => 'dark';
export const useWindowDimensions = () => ({ width: 390, height: 844, scale: 3, fontScale: 1 });
export const Animated = {
  View: make('div'), Text: make('span'),
  timing: () => ({ start: (cb?: () => void) => cb?.() }),
  spring: () => ({ start: (cb?: () => void) => cb?.() }),
  Value: class { constructor(public v = 0) {} setValue(v: number) { this.v = v; } interpolate() { return this; } },
};
export const Linking = { openURL: () => Promise.resolve() };
export const Alert = { alert: () => {} };
