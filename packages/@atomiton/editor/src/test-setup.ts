import "@testing-library/jest-dom";

declare module "vitest" {
  type AsymmetricMatchersContaining = {
    toBeInTheDocument(): void;
    toHaveClass(className: string): void;
  };
}
