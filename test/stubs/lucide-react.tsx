// Runtime stub for `lucide-react`. See ./README.md for why these exist.
//
// Icons render as an aria-hidden <svg>, which is what the pack's own iconography
// rules require of a decorative icon — so a gold that labels its icon buttons
// correctly still passes axe here, and one that relies on the icon carrying the
// name still fails. Enumerated rather than proxied: a module namespace cannot be
// a Proxy, and a missing icon must fail loudly rather than resolve to undefined
// halfway through a render.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

const icon = (name: string) => {
  const C = (props: AnyProps) =>
    React.createElement('svg', { 'aria-hidden': 'true', 'data-icon': name, ...props });
  C.displayName = name;
  return C;
};

export const Bell = icon('Bell');
export const Check = icon('Check');
export const ChevronDown = icon('ChevronDown');
export const ChevronUp = icon('ChevronUp');
export const ChevronsUpDown = icon('ChevronsUpDown');
export const Loader2 = icon('Loader2');
export const Monitor = icon('Monitor');
export const Moon = icon('Moon');
export const MoreHorizontal = icon('MoreHorizontal');
export const Plus = icon('Plus');
export const Search = icon('Search');
export const Settings = icon('Settings');
export const Sun = icon('Sun');
export const Trash2 = icon('Trash2');
export const TrendingDown = icon('TrendingDown');
export const TrendingUp = icon('TrendingUp');
export const Users = icon('Users');
