export interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
export interface DocsQueryInput { name: string; topic?: string; version?: string | null; }
export interface DocsQuery { package: string; topic: string; version: string | null; query: string; }
export interface DocsItem { source?: string; text?: string; }
export interface DocsExcerpt { source: string; text: string; }
export interface ExcerptOptions { maxChars?: number; }

export function detectPackageVersion(manifest: PackageManifest, name: string): string | null {
  const pools = [manifest.dependencies, manifest.devDependencies, manifest.peerDependencies];
  for (const pool of pools) if (pool?.[name]) return String(pool[name]);
  return null;
}

export function makeDocsQuery({ name, topic, version }: DocsQueryInput): DocsQuery {
  if (!name) throw new Error('package name required');
  const normalizedTopic = String(topic ?? '').trim();
  return {
    package: name,
    topic: normalizedTopic,
    version: version ?? null,
    query: [name, version && `version ${version}`, normalizedTopic].filter(Boolean).join(' '),
  };
}

export function selectDocsExcerpts(items: DocsItem[], { maxChars = 12000 }: ExcerptOptions = {}): DocsExcerpt[] {
  let used = 0;
  const out: DocsExcerpt[] = [];
  for (const item of items) {
    const text = String(item.text ?? '');
    if (used + text.length > maxChars) continue;
    out.push({ source: String(item.source ?? ''), text });
    used += text.length;
  }
  return out;
}
