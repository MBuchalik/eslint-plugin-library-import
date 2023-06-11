# eslint-plugin-library-import

> Improve imports from popular libraries like Lodash

Are you using a library like Lodash? Often, you want to avoid top-level imports like this:

```ts
import { isEqual } from 'lodash';
```

and rather want to use an import like this:

```ts
import isEqual from 'lodash/isEqual';
```

`eslint-plugin-library-import` helps: This plugin contains auto-fixable (!) rules for such libraries.

> Please note that this plugin currently only has support for Lodash. If there is a popular library with a similar problem as in Lodash, feel free to open an Issue or to create a PR with a new rule. Please note however that we only accept libraries that are somewhat popular (like Lodash, MUI, etc.).

## Usage

First, install this eslint plugin:

```
npm install --save-dev eslint-plugin-library-import
```

Then, add the following to the `plugins` sections of your eslint config file:

```js
plugins: ['library-import'],
```

Finally, you can activate the Lodash rule:

```js
rules: {
  'library-import/lodash': 'warn',
}
```

Once you run the ESLint auto-fixer, the imports will get rewritten.

## Examples

Examples of **incorrect** code:

```ts
// 'library-import/lodash': 'warn',

/*
  The following will get auto-fixed to:
  
  import isEqual from 'lodash/isEqual';
*/
import { isEqual } from 'lodash';

/*
  The following will get auto-fixed to:

  import isEqual from 'lodash/isEqual';
  import each from 'lodash/each';
*/
import { isEqual, each } from 'lodash';

/*
  The following will not get auto-fixed.
*/
import lodash, { isEqual } from 'lodash';

/*
  The rule also does not allow this simple default import.
*/
import lodash from 'lodash';
```

Examples of **correct** code:

```ts
// 'library-import/lodash': 'warn',

import { isEqual } from 'this-is-not-lodash';

import { type isEqual } from 'lodash';

import type lodash from 'lodash';
```
