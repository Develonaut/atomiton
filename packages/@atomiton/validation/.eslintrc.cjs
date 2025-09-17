module.exports = {
  root: true,
  extends: ['@atomiton/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};