export const extractCodeStructure = content => ({
  functions: [...String(content).matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|(?:async\s+)?([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g)].map(match => match[1] || match[2]).filter(Boolean).slice(0, 100),
  classes: [...String(content).matchAll(/class\s+([A-Za-z_$][\w$]*)/g)].map(match => match[1]).slice(0, 100),
  imports: [...String(content).matchAll(/import\s+(?:.+?\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g)].map(match => match[1] || match[2]).slice(0, 100),
  apiRoutes: [...String(content).matchAll(/(?:app|router)\.(get|post|put|patch|delete)\(['"]([^'"]+)/gi)].map(match => `${match[1].toUpperCase()} ${match[2]}`).slice(0, 100)
});
