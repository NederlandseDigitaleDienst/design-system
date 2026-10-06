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
 * - --semantics-*, --primitives-* : CSS variables (validated against variables.css)
 * - --components-* : the component layer is gone; using one is an error.
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
    const prefixes = prefixesByFolder.get(folder);
    if (!prefixes || prefixes.size === 0) return true;
    return [...prefixes].some((prefix) => varName.startsWith(`--_${prefix}-`));
  };

  // Process each component file
  for (const filePath of componentFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const folder = path.dirname(filePath);
    const folderDefs = internalDefsByFolder.get(folder) ?? new Set();
    const { usages, definitions } = parseComponentFile(filePath);

    for (const varName of definitions) {
      if (varName.startsWith('--_') && !hasOwnPrefix(varName, folder)) {
        errors.push({
          file: relativePath,
          variable: varName,
          message: `Local variable "${varName}" does not start with the name of a component in this folder (--_{tag without nldd-}-…)`,
        });
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
            errors.push({
              file: relativePath,
              variable: varName,
              message: `Local variable "${varName}" does not start with the name of a component in this folder (--_{tag without nldd-}-…)`,
            });
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
          errors.push({
            file: relativePath,
            variable: varName,
            message: `"${varName}": there is no component layer. Use a local --_{component}-* variable in :host, or a semantics token when components share the value`,
          });
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
