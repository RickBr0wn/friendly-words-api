import * as friendlyWords from 'friendly-words'

export async function handler(): Promise<any> {
  const { predicates, objects } = friendlyWords
  const numberOfPredicates = predicates.length
  const numberOfObjects = objects.length

  const randomPredicate = predicates[Math.floor(Math.random() * numberOfPredicates)]
  const randomObject = objects[Math.floor(Math.random() * numberOfObjects)]

  const output = `${randomPredicate} ${randomObject}`

  return {
    statusCode: 302,
    body: output,
  }
}
