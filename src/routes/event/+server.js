import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"
import { _unpack } from "$lib/unpack"
import checkDomain from '$lib/checkDomain'

export const _handler = async (event_id, data) => {
  const date = new Date()
  // create event object
  let event = {
    '@context': context,
    type: "Event",
    id: event_id,
    source: data.v,
    datetime: date.toISOString(),
    timestamp: date.getTime()
  }

  // If event data is not an object, just attach
  // If event data IS an object, _unpack it
  if (typeof data.e !== 'object') {
    event[`event`] = data.e
  } else {
    event = _unpack({event, obj: data.e})
  }
  return await jsonld.toRDF(event, {format: 'application/n-quads'});
}

export async function POST({ request, url }) {
  await checkDomain(request.url.origin)
  // get the ppost body
  const data = await request.json()
  // create uuid for event
  const event_id = `urn:uuid:${crypto.randomUUID()}`
  // convert get url to triples
  let triples = await _handler(event_id, data)
  // insert triples to store
  await insert({domain: url.origin, triples})
  // return 200 in response
  let response = new Response(200)
  response.headers.append('Access-Control-Allow-Origin', url.origin)

  return response
}