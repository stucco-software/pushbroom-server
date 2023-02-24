import useragent from "useragent"
import { midnight, approachingMidnight } from '$lib/datetime'
import { insert, queryBoolean } from "$lib/query"
import context from '$lib/context'
import jsonld from "jsonld"

const createSession = async ({id, agent}) => {
  const date = new Date()
  const ld = {
    '@id': id,
    '@context': context,
    '@type': 'Session',
    browser: agent.family,
    browserVersion: agent.toVersion(),
    os: agent.os.toString(),
    datetime: date.toISOString(),
    timestamp: Date.now()
  }
  const nquads = await jsonld.toRDF(ld, {format: 'application/n-quads'});
  await insert(nquads)
}

export async function GET({ request }) {
  // get the id from the eTag header
  let id = request.headers.get('if-none-match')

  // if the eTag is older than midnight today,
  // expire the session.
  let sessionExpired = id
    ? await queryBoolean(`
      ASK {
        GRAPH <${subgraph}> {
          <${id}> pushbroom:timestamp ?t
          FILTER(?t < ${midnight()} )
        }
      }
    `)
    : true


  // If there is no etag, or the session is expired,
  // create a new session.
  if (!id || sessionExpired) {
    id = `urn:uuid:${crypto.randomUUID()}`,
    await createSession({
      id,
      agent: useragent.lookup(request.headers.get('user-agent'))
    })
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
