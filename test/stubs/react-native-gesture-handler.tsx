// Runtime stub for `react-native-gesture-handler`. See ./README.md for why these
// exist. Gestures are built by chaining, so every builder method returns the
// builder; nothing recognises a gesture, because jsdom dispatches no touches.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

interface GestureBuilder {
  onBegin: () => GestureBuilder;
  onUpdate: () => GestureBuilder;
  onEnd: () => GestureBuilder;
  onFinalize: () => GestureBuilder;
  enabled: () => GestureBuilder;
  activeOffsetX: () => GestureBuilder;
  activeOffsetY: () => GestureBuilder;
  failOffsetY: () => GestureBuilder;
  minDistance: () => GestureBuilder;
  numberOfTaps: () => GestureBuilder;
}

function builder(): GestureBuilder {
  const b: GestureBuilder = {
    onBegin: () => b, onUpdate: () => b, onEnd: () => b, onFinalize: () => b,
    enabled: () => b, activeOffsetX: () => b, activeOffsetY: () => b,
    failOffsetY: () => b, minDistance: () => b, numberOfTaps: () => b,
  };
  return b;
}

export const Gesture = {
  Pan: builder,
  Tap: builder,
  LongPress: builder,
  Pinch: builder,
  Fling: builder,
  Simultaneous: builder,
  Race: builder,
  Exclusive: builder,
};

export const GestureDetector = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children as React.ReactNode);

export const GestureHandlerRootView = ({ children, ...rest }: AnyProps) =>
  React.createElement('div', rest, children as React.ReactNode);
