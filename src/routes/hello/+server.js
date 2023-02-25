import { sparql_endpoint, subgraph } from '$env/static/private'
import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"

export async function _handler(view_id, url) {
  const date = new Date()
  const query = url.searchParams
  // These two objects could be collapsed into a single
  // JSON-LD @graph array
  // Assemble view data
  const view = {
    '@context': context,
    type: 'View',
    id: view_id,
    from: query.get('r'),
    url: query.get('p'),
    width: query.get('w'),
    datetime: date.toISOString(),
    timestamp: Date.now()
  }

  // convert to triples
  const view_quads = await jsonld.toRDF(view, {format: 'application/n-quads'});

  // assemble additional session data
  const session = {
    '@context': context,
    id: `${query.get('u')}`,
    viewed: view_id
  }
  // convert to tripless
  const session_quads = await jsonld.toRDF(session, {format: 'application/n-quads'});

  return `${view_quads} ${session_quads}`
}

export async function GET({ url }) {
  // create uuid for view
  const view_id = `urn:uuid:${crypto.randomUUID()}`
  // convert get url to triples
  let triples = await_handler(view_id, url)
  // insert triples to store
  await insert(triples)
  // return view_id in response
  let response = new Response(view_id)
  // allow CORS from domain origin
  response.headers.append('Access-Control-Allow-Origin', subgraph)
  // return response
  return response
}
