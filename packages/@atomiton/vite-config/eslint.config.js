import base from '@atomiton/eslint-config/base';

export default [
  ...base,
  {
    ignores: ['dist/**', 'node_modules/**']
  }
];