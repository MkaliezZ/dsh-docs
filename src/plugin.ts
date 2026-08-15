import { makeDocsQuery, selectDocsExcerpts, type DocsItem, type DocsQuery } from './core.js';

interface CommandContext {
  command?: (name: string, handler: (...args: string[]) => unknown | Promise<unknown>) => unknown;
}
interface DocsAdapter {
  lookup: (query: DocsQuery) => Promise<DocsItem[]> | DocsItem[];
  resolveVersion?: (name: string) => Promise<string | null | undefined> | string | null | undefined;
}

export function registerDocs(ctx: CommandContext, { lookup, resolveVersion }: DocsAdapter): void {
  ctx.command?.('docs', async (name, ...topic) => {
    const version = await resolveVersion?.(name);
    const query = makeDocsQuery({ name, topic: topic.join(' '), version });
    const hits = await lookup(query);
    return JSON.stringify({ query, excerpts: selectDocsExcerpts(hits) }, null, 2);
  });
}
