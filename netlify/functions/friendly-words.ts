import type { Config, Context } from '@netlify/functions'
import predicates from '../../data/predicates.json' with { type: 'json' }
import objects from '../../data/objects.json' with { type: 'json' }

interface WordPair {
  predicate: string
  object: string
  phrase: string
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildPair(separator: string): WordPair {
  const predicate = pick(predicates)
  const object = pick(objects)
  return { predicate, object, phrase: `${predicate}${separator}${object}` }
}

export default async (req: Request, _context: Context): Promise<Response> => {
  const url = new URL(req.url)
  const count = Math.min(Math.max(parseInt(url.searchParams.get('count') ?? '1', 10), 1), 10)
  const separator = url.searchParams.get('separator') ?? ' '

  const pairs: WordPair[] = Array.from({ length: count }, () => buildPair(separator))
  const body = count === 1 ? pairs[0] : pairs

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config: Config = {
  path: '/*',
}
