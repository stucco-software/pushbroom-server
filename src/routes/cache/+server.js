import checkDomain from '$lib/checkDomain'
import { midnight, approachingMidnight } from '$lib/datetime'
import { insert, queryBoolean } from "$lib/query"
import context from '$lib/context'
import jsonld from "jsonld"

export const _createSession = async (id) => {
  const date = new Date()
  const ld = {
    '@context': context,
    'id': id,
    'type': 'Session',
    datetime: date.toISOString(),
    timestamp: date.getTime()
  }
  return await jsonld.toRDF(ld, {format: 'application/n-quads'});
}

export const _checkSessionID = async (id, domain) => {
  if (!id) {
    return true
  }
  return await queryBoolean(`
    ASK {
      GRAPH <${domain}> {
        <${id}> pushbroom:timestamp ?t
        FILTER(?t < ${midnight()} )
      }
    }
  `)
}

export const _handler = async (id, request, domain) => {
  let triples
  // get the id from the eTag header
  let session = request.headers.get('if-none-match')
  let agent = request.headers.get('user-agent')
  let sessionExpired = await _checkSessionID(session, domain)
  if (sessionExpired) {
    triples = await _createSession(id)
  }
  return triples
}

export async function GET({ request, url }) {

  let domain = request.headers.get('origin')

  if (domain) {
    console.log('request inbound from:', domain)
  }

  await checkDomain(domain)

  let id = `urn:uuid:${crypto.randomUUID()}`
  let session = request.headers.get('if-none-match')
  let triples = await _handler(id, request, domain)
  if (triples) {
    await insert({domain, triples})
    session = id
  }
  // Attach the new eTag to the response
  // Expire the header at midnight tonight.
  const response = new Response(id, {
    headers: {
      "Cache-Control": `max-age=${approachingMidnight()}`,
      "ETag": session
    }
  })
  response.headers.append('Access-Control-Allow-Origin', domain)

  return response
}
