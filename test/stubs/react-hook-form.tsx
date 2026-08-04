// Runtime stub for `react-hook-form`. See ./README.md for why these exist.
//
// A form that submits with empty values. That is enough to render every field,
// its label association and its error slot — which is what the form golds assert —
// and it is not a validation engine, which is the part `zod.ts` also declines to
// be. Errors stay empty: a stub that invented them would have every form gold
// asserting against messages no schema produced.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

export function useForm(_options?: AnyProps) {
  const [errors] = React.useState<Record<string, { message?: string }>>({});
  return {
    register: (name: string, _opts?: AnyProps) => ({
      name,
      onChange: () => {},
      onBlur: () => {},
      ref: () => {},
    }),
    handleSubmit:
      (onValid: (values: AnyProps) => unknown) =>
      (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        return onValid({});
      },
    formState: {
      errors,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
      isDirty: false,
      touchedFields: {},
      dirtyFields: {},
    },
    control: {},
    watch: () => undefined,
    setValue: () => {},
    getValues: () => ({}),
    reset: () => {},
    setError: () => {},
    clearErrors: () => {},
    setFocus: () => {},
    trigger: () => Promise.resolve(true),
  };
}

export const useFormContext = useForm;

export const FormProvider = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

export const Controller = ({ render }: { render?: (a: AnyProps) => React.ReactNode }) =>
  React.createElement(
    React.Fragment,
    null,
    render?.({
      field: { value: '', onChange: () => {}, onBlur: () => {}, name: '', ref: () => {} },
      fieldState: { error: undefined, invalid: false, isDirty: false, isTouched: false },
      formState: { errors: {} },
    }),
  );

export const useFieldArray = () => ({
  fields: [] as unknown[],
  append: () => {},
  remove: () => {},
  move: () => {},
  insert: () => {},
});

export const useWatch = () => undefined;
