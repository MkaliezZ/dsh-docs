import test from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../src/plugin.js'

type Handler = (invocation: { rawInput?: string }) => Promise<{ kind: string; text: string }>

function capture(config: unknown = {}) {
  const commands: Record<string, Handler> = {}
  apply({ commands: { register: (d: { name: string; handler: Handler }) => { commands[d.name] = d.handler } } } as never, config as never)
  return commands
}

test('docs queries through the configured adapter', async () => {
  const seen: unknown[] = []
  const handlers = capture({
    lookup: async (query: unknown) => { seen.push(query); return [{ source: 'readme', text: 'hit' }] },
    resolveVersion: async () => '1.2.3',
  })
  const result = await handlers['docs']!({ rawInput: 'react hooks' })
  assert.equal(result.kind, 'success')
  assert.equal(seen.length, 1)
  const payload = JSON.parse(result.text)
  assert.equal(payload.excerpts.length, 1)
  assert.equal(payload.query.version, '1.2.3')
})

test('docs fails closed without a lookup adapter', async () => {
  const result = await capture()['docs']!({ rawInput: 'react' })
  assert.equal(result.kind, 'error')
  assert.match(result.text, /lookup adapter/)
})
