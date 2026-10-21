#!/usr/bin/env node

/**
 * CSS Variables Validation Script
 *
 * Validates that all CSS custom properties used in components are defined.
 * Token categories:
 * - --context-* : Context variables shared between components (SKIPPED)
 * - --_* : Local variables. Defined within the same component folder, and
 *   named after a component in that folder: --_{tag without nldd-}-*. A custom
 *   property inherits through shadow boundaries, so a generic name reaches the
 *   elements of another component slotted inside.
 *   The check reads the prefix only: it does not know which component defines
 *   a variable. A folder with nldd-menu and nldd-menu-item accepts --_menu-item-*
 *   from either, which the item needs, since it reads the menu's variables. That
 *   those resolve is what src/components/subcomponent-variables.test.ts checks.
 * - --semantics-*, --primitives-* : CSS variables (validated against variables.css)
 * - --components-* : tokens of one component that a theme sets, so they live
 *   in variables.css rather than in the component's :host. Validated against
 *   variables.css, and named after a component in the folder that reads them,
 *   so the layer cannot grow back into overrides shared between components.
 *
 * It also fails on a px length in an @container or @media condition. With
 * page zoom, Safari measures a container that takes its width from the layout
 * in zoomed pixels, so a px condition keeps the wide layout; rem scales along.
 * The same goes for a px length written out in a matchMedia() string. The
 * check reads a condition on one line, up to its opening brace, and stops at a
 * `*` so a comment does not count. A condition spread over more lines, or one
 * with a calc() that multiplies, is therefore not caught.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const STYLES_FILES = [
  path.join(ROOT_DIR, 'src/assets/styles/variables.css'),
  path.join(ROOT_DIR, 'src/assets/styles/colors.generated.css'),
];
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src/components');

// Patterns
const VAR_USAGE_PATTERN = /var\(\s*(--[\w-]+)/g;
const VAR_DEFINITION_PATTERN = /(--[\w-]+)\s*:/g;

/**
 * Parse variables.css to extract all defined CSS variables
 */
function parseStylesFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Styles file not found: ${filePath}`);
    console.error('   Run "npm run build:styles" first.');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const variables = new Set();

  let match;
  while ((match = VAR_DEFINITION_PATTERN.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return variables;
}

/**
 * Find all component files (.ts and .js)
 */
function findComponentFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) &&
        !entry.name.endsWith('.stories.js') &&
        !entry.name.endsWith('.stories.ts') &&
        !entry.name.endsWith('.test.ts') &&
        !entry.name.endsWith('.test.js')
      ) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Parse a component file for CSS variable usages and definitions
 */
function parseComponentFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find all variable usages
  const usages = new Set();
  let match;
  while ((match = VAR_USAGE_PATTERN.exec(content)) !== null) {
    // Skip dynamic interpolations like `var(--primitives-space-${size})`:
    // the captured name stops at the `$`, leaving an incomplete prefix
    // that can't be validated statically. The runtime suffix is
    // constrained by the component's own TypeScript types.
    if (content[match.index + match[0].length] === '$') continue;
    usages.add(match[1]);
  }

  // Find all variable definitions (internal --_* variables)
  const definitions = new Set();
  VAR_DEFINITION_PATTERN.lastIndex = 0;
  while ((match = VAR_DEFINITION_PATTERN.exec(content)) !== null) {
    definitions.add(match[1]);
  }

  // Also detect dynamically set variables via styleMap or direct assignment
  // Pattern: styles['--_var-name'] = ... or styles["--_var-name"] = ...
  const dynamicVarPattern = /styles\[['"](-{2}_[\w-]+)['"]\]\s*=/g;
  while ((match = dynamicVarPattern.exec(content)) !== null) {
    definitions.add(match[1]);
  }

  return { usages, definitions };
}

/**
 * Categorize a CSS variable by its prefix
 */
function categorizeVariable(varName) {
  if (varName.startsWith('--context-')) return 'context';
  if (varName.startsWith('--_')) return 'internal';
  if (varName.startsWith('--components-')) return 'components';
  if (varName.startsWith('--semantics-')) return 'style';
  if (varName.startsWith('--primitives-')) return 'style';
  return 'unknown';
}

/**
 * Main validation function
 */
function validate() {
  console.log('🔍 Validating CSS variables...\n');

  // Parse styles
  const variables = new Set();
  for (const file of STYLES_FILES) {
    for (const v of parseStylesFile(file)) variables.add(v);
  }
  console.log(`📦 Found ${variables.size} variables across ${STYLES_FILES.length} style files\n`);

  // Find component files
  const componentFiles = findComponentFiles(COMPONENTS_DIR);
  console.log(`📁 Found ${componentFiles.length} component files\n`);

  const errors = [];
  const warnings = [];
  const stats = {
    totalUsages: 0,
    contextVars: 0,
    internalVars: 0,
    styleVars: 0,
    unknownVars: 0,
  };

  // First pass: collect internal definitions per component folder so a var
  // can be defined in styles.ts and used in template.ts within the same component.
  const internalDefsByFolder = new Map();
  for (const filePath of componentFiles) {
    const folder = path.dirname(filePath);
    const { definitions } = parseComponentFile(filePath);
    if (!internalDefsByFolder.has(folder)) {
      internalDefsByFolder.set(folder, new Set());
    }
    const folderDefs = internalDefsByFolder.get(folder);
    for (const def of definitions) folderDefs.add(def);
  }

  // The prefixes a local may carry in a folder: the tags its components register.
  const prefixesByFolder = new Map();
  for (const filePath of componentFiles) {
    const folder = path.dirname(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const tags = [...content.matchAll(/(?:@customElement\(|customElements\.define\()\s*['"]nldd-([a-z0-9-]+)['"]/g)].map((m) => m[1]);
    if (!prefixesByFolder.has(folder)) prefixesByFolder.set(folder, new Set());
    for (const tag of tags) prefixesByFolder.get(folder).add(tag);
  }
  const hasOwnPrefix = (varName, folder) => {
    const prefixes = prefixesByFolder.get(folder) ?? new Set();
    return [...prefixes].some((prefix) => varName.startsWith(`--_${prefix}-`));
  };
  // The component a --components-* token is named after: the longest name that
  // matches, so --components-button-group-* belongs to button-group, not button.
  const allComponentPrefixes = [...new Set([...prefixesByFolder.values()].flatMap((prefixes) => [...prefixes]))]
    .sort((a, b) => b.length - a.length);
  const componentOf = (varName) => allComponentPrefixes.find((prefix) => varName.startsWith(`--components-${prefix}-`));
  const namesAComponent = (varName) => componentOf(varName) !== undefined;
  const hasOwnComponentPrefix = (varName, folder) => (prefixesByFolder.get(folder) ?? new Set()).has(componentOf(varName));
  const prefixError = (file, varName) => ({
    file,
    variable: varName,
    message: `Local variable "${varName}" does not start with the name of a component in this folder (--_{tag without nldd-}-…)`,
  });

  // Process each component file
  for (const filePath of componentFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const folder = path.dirname(filePath);
    const folderDefs = internalDefsByFolder.get(folder) ?? new Set();
    const { usages, definitions } = parseComponentFile(filePath);

    for (const varName of definitions) {
      if (varName.startsWith('--_') && !hasOwnPrefix(varName, folder)) {
        errors.push(prefixError(relativePath, varName));
      }
    }

    for (const varName of usages) {
      stats.totalUsages++;
      const category = categorizeVariable(varName);

      switch (category) {
        case 'context':
          // --context-* variables are shared across components, skip validation
          stats.contextVars++;
          break;

        case 'internal':
          // --_* variables must be defined somewhere in the component folder
          stats.internalVars++;
          if (!hasOwnPrefix(varName, folder)) {
            errors.push(prefixError(relativePath, varName));
          } else if (!folderDefs.has(varName)) {
            errors.push({
              file: relativePath,
              variable: varName,
              message: `Internal variable "${varName}" is used but not defined in this component`,
            });
          }
          break;

        case 'style':
          // CSS variables must exist in variables.css
          stats.styleVars++;
          if (!variables.has(varName)) {
            errors.push({
              file: relativePath,
              variable: varName,
              message: `Variable "${varName}" is not defined in variables.css`,
            });
          }
          break;

        case 'components':
          stats.styleVars++;
          if (!namesAComponent(varName)) {
            errors.push({
              file: relativePath,
              variable: varName,
              message: `"${varName}" does not start with the name of a component (--components-{tag without nldd-}-…)`,
            });
          } else if (!hasOwnComponentPrefix(varName, folder)) {
            errors.push({
              file: relativePath,
              variable: varName,
              message: `"${varName}" is the token of another component. A --components-* token is read only by the component it is named after; share a value through a semantics token`,
            });
          } else if (!variables.has(varName)) {
            errors.push({
              file: relativePath,
              variable: varName,
              message: `Variable "${varName}" is not defined in variables.css`,
            });
          }
          break;

        case 'unknown':
          // Unknown prefix - warn but don't fail
          stats.unknownVars++;
          warnings.push({
            file: relativePath,
            variable: varName,
            message: `Variable "${varName}" has unknown prefix`,
          });
          break;
      }
    }
  }

  // A px length in a query condition: the condition runs up to the opening
  // brace on the same line, so a mention in a comment does not count. A value
  // built at runtime (`${below}`) carries no literal and passes.
  const QUERY_PX = /@(container|media)\b[^{\n;*`]*?\b\d+(\.\d+)?px\b[^{\n;*`]*\{/g;
  // The same in a matchMedia() string written out in script.
  const MATCH_MEDIA_PX = /matchMedia\(\s*['"`][^'"`]*?\b\d+(\.\d+)?px\b[^'"`]*['"`]\s*\)/g;
  const queryFiles = [];
  const walkQueries = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walkQueries(fullPath);
      else if (/\.(ts|js|css)$/.test(entry.name) && !/\.(stories|test)\.[tj]s$/.test(entry.name)) queryFiles.push(fullPath);
    }
  };
  walkQueries(path.join(ROOT_DIR, 'src'));
  for (const filePath of queryFiles) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const match of [...source.matchAll(QUERY_PX), ...source.matchAll(MATCH_MEDIA_PX)]) {
      const line = source.slice(0, match.index).split('\n').length;
      errors.push({
        file: `${path.relative(ROOT_DIR, filePath)}:${line}`,
        variable: match[0],
        message: `"${match[0].replace(/\s+/g, ' ').trim()}" has a px length. Write the condition in rem (40rem, not 640px): with page zoom, Safari measures a container in zoomed pixels`,
      });
    }
  }

  // Print statistics
  console.log('📊 Statistics:');
  console.log(`   Total variable usages: ${stats.totalUsages}`);
  console.log(`   Context variables (--context-*): ${stats.contextVars} (skipped)`);
  console.log(`   Internal variables (--_*): ${stats.internalVars}`);
  console.log(`   CSS variables: ${stats.styleVars}`);
  if (stats.unknownVars > 0) {
    console.log(`   Unknown prefix: ${stats.unknownVars}`);
  }
  console.log('');

  // Print warnings
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s):\n`);
    for (const warning of warnings) {
      console.log(`   ${warning.file}`);
      console.log(`   └─ ${warning.message}\n`);
    }
  }

  // Print errors
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} error(s):\n`);
    for (const error of errors) {
      console.log(`   ${error.file}`);
      console.log(`   └─ ${error.message}\n`);
    }
    console.log('Validation failed!');
    process.exit(1);
  }

  console.log('✅ All CSS variables validated successfully!\n');
}

// Run validation
validate();
