import { subgraph } from '$env/static/private'
import useragent from "useragent"
import { midnight, approachingMidnight } from '$lib/datetime'
import { insert, queryBoolean } from "$lib/query"
import context from '$lib/context'
import jsonld from "jsonld"

export const _createSession = async ({id, agent}) => {
  const date = new Date()
  const ld = {
    '@context': context,
    'id': id,
    'type': 'Session',
    browser: agent.family,
    browserVersion: agent.toVersion(),
    os: agent.os.toString(),
    datetime: date.toISOString(),
    timestamp: date.getTime()
  }
  return await jsonld.toRDF(ld, {format: 'application/n-quads'});
}

export const _checkSessionID = async (id) => {
  console.log('_checkSessionID')
  console.log(id)
  if (!id) {
    return true
  }
  console.log('query the ol DB')
  return await queryBoolean(`
    ASK {
      GRAPH <${subgraph}> {
        <${id}> pushbroom:timestamp ?t
        FILTER(?t < ${midnight()} )
      }
    }
  `)
}

export const _handler = async (id, request) => {
  let triples
  // get the id from the eTag header
  let session = request.headers.get('if-none-match')
  let agent = request.headers.get('user-agent')
  let sessionExpired = await _checkSessionID(session)

  console.log(sessionExpired)

  if (sessionExpired) {
    triples = await _createSession({
      id,
      agent: useragent.lookup(request.headers.get('user-agent'))
    })
  }
  return triples
}

export async function GET({ request }) {
  let id = `urn:uuid:${crypto.randomUUID()}`
  let triples = _handler(id, request)
  if (triples) {
    await insert(triples)
  }
  // Attach the new eTag to the response
  // Expire the header at midnight tonight.
  const response = new Response(id, {
    headers: {
      "Cache-Control": `max-age=${approachingMidnight()}`,
      "ETag": id
    }
  })
  response.headers.append('Access-Control-Allow-Origin', subgraph)

  return response
}
