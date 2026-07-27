// Registers @testing-library/jest-dom's matchers (toHaveAttribute, toHaveValue,
// toBeInTheDocument, …) on vitest's expect. Without this every gold test that
// asserts on the DOM fails with "Invalid Chai property".
import '@testing-library/jest-dom/vitest';
