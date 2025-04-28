
import checkDomain from '$lib/checkDomain'
import { midnight, approachingMidnight } from '$lib/datetime'
import { insert, queryBoolean } from "$lib/query"
import context from '$lib/context'
import jsonld from "jsonld"
import useragent from 'useragent'

export const _createSession = async (id, agent) => {
  const date = new Date()
  const ld = {
    '@context': context,
    'id': id,
    'type': 'Session',
    datetime: date.toISOString(),
    timestamp: date.getTime(),
    browser: agent.family,
    browserVersion: agent.toVersion(),
    os: agent.os.family
  }
  return await jsonld.toRDF(ld, {format: 'application/n-quads'});
}

export const _checkSessionID = async (id, domain) => {
  console.log(`if no id, return true. Why?`)
  if (!id) {
    return true
  }
  console.log('as if this session is valid or not…')
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
  console.log(`get the id from eTag header`)
  let session = request.headers.get('if-none-match')
  console.log(session)
  console.log(`now check session id…`)
  let sessionExpired = await _checkSessionID(session, domain)
  console.log(`session is expired?`, sessionExpired)
  if (sessionExpired) {
    console.log(`yeah this is expored, please make a new one:`)
    let agentstring = request.headers.get('user-agent')
    let agent = useragent.lookup(agentstring)
    triples = await _createSession(id, agent)
    console.log(triples)
  }
  return triples
}

export async function GET({ request, url }) {
  console.log('get dat cache')
  console.log(request.headers)
  let domain = request.headers.get('origin')

  if (domain) {
    console.log('request inbound from:', domain)
  }

  await checkDomain(domain)

  let id = `urn:uuid:${crypto.randomUUID()}`
  let session = request.headers.get('if-none-match')
  let etag = request.headers.get('ETag')
  console.log(`some new id…`, id)
  console.log(`some old id…`, etag, session)

  // let triples = await _handler(id, request, domain)
  // if (triples) {
  //   await insert({domain, triples})
  //   session = id
  // }
  // Attach the new eTag to the response
  // Expire the header at midnight tonight.
  const response = new Response(id, {
    headers: {
      // "Cache-Control": `max-age=${approachingMidnight()}`,
      "ETag": id
    }
  })
  response.headers.append('Access-Control-Allow-Origin', domain)
  return response
}
