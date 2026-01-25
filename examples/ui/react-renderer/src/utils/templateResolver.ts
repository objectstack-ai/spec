/**
 * Template Expression Resolver
 */

export function resolveTemplate(template: any, data: any): any {
  if (typeof template !== 'string') {
    return template;
  }

  // Single expression
  const singleMatch = template.match(/^\{([^}]+)\}$/);
  if (singleMatch) {
    const value = getNestedValue(data, singleMatch[1]);
    return value !== undefined ? value : template;
  }

  // Replace all expressions
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined ? String(value) : match;
  });
}

export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}
