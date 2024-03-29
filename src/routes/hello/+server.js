import checkDomain from '$lib/checkDomain'
import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"

export async function _handler(view_id, url) {
  const date = new Date()
  const query = url.searchParams
  // Assemble view data
  let data = {
    '@context': context,
    '@graph': [
      {
        type: 'View',
        id: view_id,
        from: query.get('r'),
        url: query.get('p'),
        width: query.get('w'),
        datetime: date.toISOString(),
        timestamp: Date.now()
      },{
        id: `${query.get('u')}`,
        viewed: view_id
      }
    ]
  }
  return await jsonld.toRDF(data, {format: 'application/n-quads'})
}

export async function GET({ request,url }) {
  let domain = request.headers.get('origin')
  await checkDomain(domain)
  // create uuid for view
  const view_id = `urn:uuid:${crypto.randomUUID()}`
  // convert get url to triples
  let triples = await _handler(view_id, url)
  // insert triples to store
  await insert({domain, triples})
  // return view_id in response
  let response = new Response(view_id)
  // allow CORS from domain origin
  response.headers.append('Access-Control-Allow-Origin', domain)
  // return response
  return response
}
