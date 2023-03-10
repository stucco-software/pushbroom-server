import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"
import { _unpack } from "$lib/unpack"
import { subgraph } from '$env/static/private'

export const _handler = async (data) => {
  const date = new Date()
  // create event object
  let event = {
    '@context': context,
    id: data.sid,
  }

  if (typeof data.c !== 'object') {
    event[`context`] = data.c
  } else {
    event = _unpack({event, obj: data.c})
  }
  return await jsonld.toRDF(event, {format: 'application/n-quads'});
}

export async function POST({ request }) {
  // get the ppost body
  const data = await request.json()
  // create uuid for event
  // convert get url to triples
  let triples = await _handler(data)
  // insert triples to store

  await insert(triples)
  // return 200 in response
  let response = new Response(200)
  response.headers.append('Access-Control-Allow-Origin', subgraph)

  return response
}