import type { TSESTree } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';
import { RuleFix } from '@typescript-eslint/utils/dist/ts-eslint';

const betterLodashImport = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    messages: {
      useDefaultImport: 'Import from lodash/{{name}} instead.',
      useDefaultImports:
        'Wherever possible, use default imports from lodash/{name-of-the-module}.',
    },
    type: 'problem',
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],

  create: (context) => {
    return {
      ImportDeclaration: (importDeclarationNode): void => {
        if (importDeclarationNode.importKind !== 'value') {
          return;
        }

        if (importDeclarationNode.source.value !== 'lodash') {
          return;
        }

        const specifiersToFix: TSESTree.ImportSpecifier[] = [];

        for (const singleSpecifier of importDeclarationNode.specifiers) {
          if (
            singleSpecifier.type !== 'ImportSpecifier' ||
            singleSpecifier.importKind !== 'value' ||
            !isProbablyDefaultImportable(singleSpecifier)
          ) {
            continue;
          }

          specifiersToFix.push(singleSpecifier);

          context.report({
            messageId: 'useDefaultImport',
            data: {
              name: singleSpecifier.imported.name,
            },
            node: singleSpecifier,
          });
        }

        if (specifiersToFix.length < 1) {
          return;
        }

        context.report({
          messageId: 'useDefaultImports',
          node: importDeclarationNode,
          fix: (fixer) => {
            if (
              context.getSourceCode().getCommentsInside(importDeclarationNode)
                .length > 0
            ) {
              // There are comments. We do not want to lose them, so we disable fixing here.
              return null;
            }

            /*
              It is possible that some of the import specifiers need to be kept.
              Since this is probably a rare edge case, we simply do not provide a fixer for this (yet).
            */

            if (
              specifiersToFix.length < importDeclarationNode.specifiers.length
            ) {
              return null;
            }

            const fixes: RuleFix[] = [];

            const newImports: string[] = [];
            for (const singleSpecifier of specifiersToFix) {
              newImports.push(buildNewImport(singleSpecifier));
            }
            const newImportsAsString = newImports.join('\n');

            // Replace the original import statement with our new imports.
            fixes.push(
              fixer.replaceText(importDeclarationNode, newImportsAsString),
            );

            return fixes;
          },
        });
      },
    };
  },
});

/**
 * Is the given Specifier probably importable using a default import like the following example?
 * ```
 * import isEqual from 'lodash/isEqual';
 * ```
 *
 * We use a heuristic for this: If the name starts with a lowercase character, then we assume that the default import is possible.
 *
 */
function isProbablyDefaultImportable(
  specifier: TSESTree.ImportSpecifier,
): boolean {
  const regex = new RegExp('^[a-z]');
  return regex.test(specifier.imported.name);
}

function buildNewImport(node: TSESTree.ImportSpecifier): string {
  return `import ${node.local.name} from 'lodash/${node.imported.name}';`;
}

export = betterLodashImport;
