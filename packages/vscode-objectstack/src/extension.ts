// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import * as vscode from 'vscode';

/** Well-known ObjectStack field types for hover documentation */
const FIELD_TYPE_DOCS: Record<string, string> = {
  text: 'Single-line text field (max 255 chars by default)',
  textarea: 'Multi-line text area for longer content',
  richtext: 'Rich text editor with HTML formatting',
  number: 'Decimal number with configurable precision',
  integer: 'Whole number without decimals',
  currency: 'Monetary value with currency code',
  boolean: 'True/false toggle',
  date: 'Calendar date (no time)',
  datetime: 'Date with time and timezone',
  select: 'Single-choice picklist (requires `options`)',
  multiselect: 'Multi-choice picklist (requires `options`)',
  lookup: 'Reference to another object (requires `reference`)',
  master_detail: 'Parent-child relationship with cascade delete',
  formula: 'Computed field using expressions',
  email: 'Email address with validation',
  phone: 'Phone number',
  url: 'URL with protocol validation',
  image: 'Image file reference',
  file: 'File attachment reference',
  json: 'Arbitrary JSON data',
  uuid: 'Universally unique identifier',
  slug: 'URL-friendly identifier (auto-generated from name)',
  rating: 'Numeric star rating',
  color: 'Hex color value (#RRGGBB)',
  vector: 'Numeric vector for AI embeddings and similarity search',
  encrypted: 'Encrypted at rest — displayed masked in UI',
  autonumber: 'Auto-incrementing display number',
  geo_point: 'Geographic coordinates (lat/lng)',
};

/** ObjectStack schema keywords for hover tooltips */
const SCHEMA_DOCS: Record<string, string> = {
  defineStack: 'Define an ObjectStack project or plugin. Validates against ObjectStackDefinitionSchema.',
  defineView: 'Type-safe helper to define a list or form view for an object.',
  defineApp: 'Type-safe helper to define an application with navigation.',
  defineFlow: 'Type-safe helper to define an automation flow.',
  defineAgent: 'Type-safe helper to define an AI agent with tools and instructions.',
  manifest: 'Project package configuration — name, version, label, and metadata.',
  objects: 'Business object definitions with fields, validation, and relationships.',
  views: 'List and form view configurations for object data display.',
  flows: 'Automation flows — screen flows, auto-launched, or scheduled.',
  agents: 'AI agent definitions with model config, tools, and instructions.',
  actions: 'Button actions, batch operations, and URL redirects.',
  dashboards: 'Analytics dashboard layouts with widget grids.',
  permissions: 'Permission sets defining CRUD access per object and field.',
  roles: 'User role hierarchy for access control.',
  plugins: 'External plugins to load into the stack.',
  ownership: "Record ownership model: 'own' (creator-owned) or 'shared'.",
  objectName: 'Snake_case reference to a business object (e.g. project_task).',
};

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext): void {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('objectstack');
  context.subscriptions.push(diagnosticCollection);

  // Watch for objectstack.config.ts changes
  const configWatcher = vscode.workspace.createFileSystemWatcher('**/objectstack.config.ts');

  configWatcher.onDidChange((uri) => {
    validateConfigFile(uri);
  });

  configWatcher.onDidCreate((uri) => {
    validateConfigFile(uri);
  });

  context.subscriptions.push(configWatcher);

  // Register hover provider for TypeScript files
  const hoverProvider = vscode.languages.registerHoverProvider(
    [
      { scheme: 'file', pattern: '**/*.object.ts' },
      { scheme: 'file', pattern: '**/*.view.ts' },
      { scheme: 'file', pattern: '**/objectstack.config.ts' },
      { scheme: 'file', language: 'typescript' },
    ],
    {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position);
        if (!range) return undefined;

        const word = document.getText(range);

        // Check schema-level keywords
        if (SCHEMA_DOCS[word]) {
          return new vscode.Hover(
            new vscode.MarkdownString(`**ObjectStack** — \`${word}\`\n\n${SCHEMA_DOCS[word]}`),
          );
        }

        // Check field type values (e.g. type: 'text')
        const line = document.lineAt(position.line).text;
        const typeMatch = line.match(/type:\s*['"](\w+)['"]/);
        if (typeMatch && FIELD_TYPE_DOCS[typeMatch[1]]) {
          const fieldType = typeMatch[1];
          if (word === fieldType || word === 'type') {
            return new vscode.Hover(
              new vscode.MarkdownString(
                `**ObjectStack Field Type** — \`${fieldType}\`\n\n${FIELD_TYPE_DOCS[fieldType]}`,
              ),
            );
          }
        }

        return undefined;
      },
    },
  );

  context.subscriptions.push(hoverProvider);

  // Register code action provider stub for quick fixes
  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    [
      { scheme: 'file', pattern: '**/*.object.ts' },
      { scheme: 'file', pattern: '**/*.view.ts' },
      { scheme: 'file', pattern: '**/objectstack.config.ts' },
    ],
    {
      provideCodeActions(document, range, context) {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
          if (diagnostic.source !== 'objectstack') continue;

          // Quick fix: add missing label
          if (diagnostic.message.includes('missing label')) {
            const fix = new vscode.CodeAction(
              'Add missing label property',
              vscode.CodeActionKind.QuickFix,
            );
            fix.diagnostics = [diagnostic];
            fix.isPreferred = true;
            actions.push(fix);
          }

          // Quick fix: convert to snake_case
          if (diagnostic.message.includes('snake_case')) {
            const fix = new vscode.CodeAction(
              'Convert name to snake_case',
              vscode.CodeActionKind.QuickFix,
            );
            fix.diagnostics = [diagnostic];
            actions.push(fix);
          }
        }

        return actions;
      },
    },
    { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] },
  );

  context.subscriptions.push(codeActionProvider);

  // Validate open config files on activation
  if (vscode.window.activeTextEditor) {
    const uri = vscode.window.activeTextEditor.document.uri;
    if (uri.fsPath.endsWith('objectstack.config.ts')) {
      validateConfigFile(uri);
    }
  }
}

/**
 * Basic validation for objectstack.config.ts files.
 * Checks for common structural issues and reports diagnostics.
 */
function validateConfigFile(uri: vscode.Uri): void {
  const document = vscode.workspace.textDocuments.find(
    (doc) => doc.uri.toString() === uri.toString(),
  );
  if (!document) return;

  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();

  // Check for missing manifest
  if (text.includes('defineStack') && !text.includes('manifest')) {
    const defineStackPos = text.indexOf('defineStack');
    const pos = document.positionAt(defineStackPos);
    diagnostics.push(
      new vscode.Diagnostic(
        new vscode.Range(pos, pos.translate(0, 'defineStack'.length)),
        'defineStack requires a "manifest" property with name and version',
        vscode.DiagnosticSeverity.Warning,
      ),
    );
  }

  // Check for camelCase object names (should be snake_case)
  const nameMatches = text.matchAll(/name:\s*['"]([a-z][a-zA-Z]+)['"]/g);
  for (const match of nameMatches) {
    if (match[1] && /[A-Z]/.test(match[1]) && match.index !== undefined) {
      const pos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      diagnostics.push(
        new vscode.Diagnostic(
          new vscode.Range(pos, endPos),
          `Object/field name "${match[1]}" should use snake_case (e.g. "${toSnakeCase(match[1])}")`,
          vscode.DiagnosticSeverity.Warning,
        ),
      );
    }
  }

  diagnosticCollection.set(uri, diagnostics);
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function deactivate(): void {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
