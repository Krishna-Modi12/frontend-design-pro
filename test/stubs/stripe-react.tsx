// Runtime stub for `@stripe/react-stripe-js`. See ./README.md for why these exist.
//
// The real PaymentElement is a cross-origin iframe. Nothing inside it is
// reachable from a test in any environment, hosted or stubbed, so a placeholder
// with a test id is the whole honest surface. `confirmPayment` resolves without
// an error so the checkout gold's success branch is reachable.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

export const Elements = ({ children }: AnyProps) =>
  React.createElement(React.Fragment, null, children as React.ReactNode);

export const PaymentElement = (props: AnyProps) =>
  React.createElement('div', { 'data-testid': 'payment-element', ...props });

export const CardElement = PaymentElement;
export const AddressElement = (props: AnyProps) =>
  React.createElement('div', { 'data-testid': 'address-element', ...props });

export const useStripe = () => ({
  confirmPayment: () => Promise.resolve({ error: undefined }),
  confirmCardPayment: () => Promise.resolve({ error: undefined }),
  createPaymentMethod: () => Promise.resolve({ error: undefined, paymentMethod: { id: 'pm_stub' } }),
});

export const useElements = () => ({
  getElement: () => null,
  submit: () => Promise.resolve({ error: undefined }),
});
