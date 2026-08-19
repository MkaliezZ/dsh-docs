import { makeDocsQuery, selectDocsExcerpts, type DocsItem, type DocsQuery } from './core.js'

export const name = 'docs'
export const inject = ['commands']

export interface DocsAdapter {
  lookup: (query: DocsQuery) => Promise<DocsItem[]> | DocsItem[]
  resolveVersion?: (name: string) => Promise<string | null | undefined> | string | null | undefined
}

export interface Config {
  lookup?: DocsAdapter['lookup']
  resolveVersion?: DocsAdapter['resolveVersion']
}

export function apply(ctx: any, config: Config = {}): void {
  ctx.commands.register({
    name: 'docs',
    description: 'Version-aware documentation query with bounded excerpts (host-supplied lookup).',
    input: { hint: '<package> [topic]' },
    recordInput: false,
    async handler(invocation: any) {
      if (!config.lookup) return { kind: 'error', text: 'docs requires a lookup adapter via plugin config' }
      const [docName = '', ...topic] = String(invocation.rawInput ?? '').trim().split(/\s+/)
      if (!docName) return { kind: 'error', text: 'usage: /docs <package> [topic]' }
      try {
        const version = (await config.resolveVersion?.(docName)) ?? null
        const query = makeDocsQuery({ name: docName, topic: topic.join(' '), version })
        const hits = await config.lookup(query)
        return { kind: 'success', text: JSON.stringify({ query, excerpts: selectDocsExcerpts(hits) }, null, 2) }
      } catch (error) {
        return { kind: 'error', text: `docs lookup failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })
}