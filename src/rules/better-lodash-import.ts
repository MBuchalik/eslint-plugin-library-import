import type { TSESTree } from '@typescript-eslint/types';
import { ESLintUtils } from '@typescript-eslint/utils';

const betterLodashImport = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    messages: {
      useDefaultImport: 'Import from lodash/{{name}} instead.',
      useDefaultImports:
        'Wherever possible, use default imports from lodash/{name-of-the-module}.',
      noTopLevelDefaultImport: 'Do not use a default import from lodash',
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

        const defaultImportSpecifier = importDeclarationNode.specifiers.find(
          (specifier) => specifier.type === 'ImportDefaultSpecifier',
        );
        if (defaultImportSpecifier) {
          context.report({
            messageId: 'noTopLevelDefaultImport',
            node: defaultImportSpecifier,
          });
        }

        const specifiersToFix: TSESTree.ImportSpecifier[] = [];
        for (const specifier of importDeclarationNode.specifiers) {
          if (
            specifier.type !== 'ImportSpecifier' ||
            specifier.importKind !== 'value' ||
            !isProbablyDefaultImportable(specifier)
          ) {
            continue;
          }

          specifiersToFix.push(specifier);

          context.report({
            messageId: 'useDefaultImport',
            data: {
              name: specifier.imported.name,
            },
            node: specifier,
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

            const newImports: string[] = [];
            for (const singleSpecifierToFix of specifiersToFix) {
              const newImport = buildNewImport(singleSpecifierToFix);
              newImports.push(newImport);
            }
            const newImportsAsString = newImports.join('\n');

            // Replace the original import statement with our new imports.
            return fixer.replaceText(importDeclarationNode, newImportsAsString);
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
