import { sparql_endpoint, subgraph } from '$env/static/private'
import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"

export async function GET({ url }) {
  const date = new Date()
  const query = url.searchParams
  const view_id = `urn:uuid:${crypto.randomUUID()}`

  // These two objects could be collapsed into a single
  // JSON-LD @graph array
  // Assemble view data
  const view = {
    '@context': context,
    type: 'View',
    id: view_id,
    from: q.get('r'),
    url: q.get('p'),
    width: q.get('w'),
    datetime: date.toISOString(),
    timestamp: Date.now()
  }

  // convert to triples
  const view_quads = await jsonld.toRDF(view, {format: 'application/n-quads'});

  // assemble additional session data
  const session = {
    '@context': context,
    id: `${q.get('u')}`,
    viewed: view_id
  }
  // convert to tripless
  const session_quads = await jsonld.toRDF(session, {format: 'application/n-quads'});

  // insert triples to store
  await insert(`${view_quads} ${session_quads}`)

  let response = new Response(view_id)
  response.headers.append('Access-Control-Allow-Origin', subgraph)

  return response
}
