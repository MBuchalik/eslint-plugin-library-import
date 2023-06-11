import { ESLintUtils } from '@typescript-eslint/utils';

import betterLodashImport from './better-lodash-import';

const tester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
});

tester.run('no-node-import', betterLodashImport, {
  valid: [
    { code: `import { item } from 'this-is-not-lodash';` },
    { code: `import { NotFixable } from 'lodash';` },
    { code: `import defaultImport from 'lodash';` },
    { code: `import { type isEqual } from 'lodash';` },
    { code: `import type { isEqual } from 'lodash';` },
  ],
  invalid: [
    {
      code: `import { isEqual } from 'lodash';`,
      output: `import isEqual from 'lodash/isEqual';`,
      errors: [
        { messageId: 'useDefaultImports' },
        { messageId: 'useDefaultImport' },
      ],
    },
    {
      code: `import { isEqual, each } from 'lodash';`,
      // eslint-disable-next-line prettier/prettier
      output:
`import isEqual from 'lodash/isEqual';
import each from 'lodash/each';`,
      errors: [
        { messageId: 'useDefaultImports' },
        { messageId: 'useDefaultImport' },
        { messageId: 'useDefaultImport' },
      ],
    },
    {
      code: `import { isEqual, NotFixable } from 'lodash';`,
      output: `import { isEqual, NotFixable } from 'lodash';`,
      errors: [
        { messageId: 'useDefaultImports' },
        { messageId: 'useDefaultImport' },
      ],
    },
    {
      code: `import defaultImport, { isEqual } from 'lodash';`,
      output: `import defaultImport, { isEqual } from 'lodash';`,
      errors: [
        { messageId: 'useDefaultImports' },
        { messageId: 'useDefaultImport' },
      ],
    },
    {
      code: `import { isEqual, type each } from 'lodash';`,
      output: `import { isEqual, type each } from 'lodash';`,
      errors: [
        { messageId: 'useDefaultImports' },
        { messageId: 'useDefaultImport' },
      ],
    },
    {
      code: `import { isEqual as renamed } from 'lodash';`,
      output: `import renamed from 'lodash/isEqual';`,
      errors: [
        { messageId: 'useDefaultImports' },
        { messageId: 'useDefaultImport' },
      ],
    },
  ],
});
