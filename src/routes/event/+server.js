import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"

export const _unpack = ({event, obj}) => {
  let keys = [...Object.keys(obj)]
  let newEvent = Object.assign(event, {})
  keys.forEach(key => {
    if (key === 'pushbroom') {
      // can be abstracted with below but brain not right now
      try {
        let json = JSON.parse(obj[key])
        newEvent[`event`] = json
        _unpack({event: json, obj: json})
      } catch {
        newEvent[`event`] = obj[key]
      }
    } else {
      let shortKey = key.replace('pushbroom', '').toLowerCase()
      // can be abstracted with above but brain not right now
      try {
        let json = JSON.parse(obj[key])
        newEvent[shortKey] = json
        _unpack({event: json, obj: json})
      } catch {
        newEvent[shortKey] = obj[key]
      }
    }
  })
  return newEvent
}

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

export async function POST({ request }) {
  // get the ppost body
  const data = await request.json()
  // create uuid for event
  const event_id = `urn:uuid:${crypto.randomUUID()}`
  // convert get url to triples
  let triples = await _handler(event_id, url)
  console.log(triples)
  // insert triples to store
  await insert(triples)
  // return 200 in response
  let response = new Response(200)
  response.headers.append('Access-Control-Allow-Origin', subgraph)

  return response
}