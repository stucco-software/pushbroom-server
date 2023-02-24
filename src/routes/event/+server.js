import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"

function unpack({event, obj}) {
  let keys = [...Object.keys(obj)]
  keys.forEach(key => {
    if (key === 'pushbroom') {
      // can be abstracted with below but brain not right now
      try {
        let json = JSON.parse(obj[key])
        event[`event`] = json
        unpack({event: json, obj: json})
      } catch {
        event[`event`] = obj[key]
      }
    } else {
      let shortKey = key.replace('pushbroom', '').toLowerCase()
      // can be abstracted with above but brain not right now
      try {
        let json = JSON.parse(obj[key])
        event[`event:${shortKey}`] = json
        unpack({event: json, obj: json})
      } catch {
        event[`event:${shortKey}`] = obj[key]
      }
    }
  })
  return event
}

export async function POST({ request }) {
  const date = new Date()
  const q = await request.json()
  const event_id = `urn:uuid:${crypto.randomUUID()}`

  // create event object
  let event = {
    '@context': context,
    type: "Event",
    id: event_id,
    source: q.v,
    datetime: date.toISOString(),
    timestamp: Date.now()
  }

  // If event data is not an object, just attach
  // If event data IS an object, unpack it
  if (typeof q.e !== 'object') {
    event[`event:value`] = q.e
  } else {
    let keys = [...Object.keys(q.e)]
    event = unpack({event, obj: q.e})
  }

  // convert to triples
  const event_quads = await jsonld.toRDF(event, {format: 'application/n-quads'});

  // insert to store
  await insert(event_quads)

  let response = new Response(200)
  response.headers.append('Access-Control-Allow-Origin', subgraph)

  return response
}