module.exports = {
  "*.{ts,tsx,js,jsx,md,json}": ["prettier --write"],
  "*.{ts,tsx,js,jsx}": [
    "turbo run lint:fix --affected --continue",
    "turbo run test --affected --continue"
  ],
};
