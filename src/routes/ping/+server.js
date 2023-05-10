import checkDomain from '$lib/checkDomain'
import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"

export async function _handler(id, url) {
  const query = url.searchParams
  const date = new Date()

  let data = {
    '@context': context,
    id: id,
    datetime: date.toISOString(),
    timestamp: Date.now(),
  }

  // mutation bad! But okay for right this second
  for (const [key, value] of query) {
    data[key] = value
  }

  return await jsonld.toRDF(data, {format: 'application/n-quads'})
}

export async function GET({ request,url }) {
  let domain = request.headers.get('origin')
  await checkDomain(domain)
  // create uuid for view
  const id = `urn:uuid:${crypto.randomUUID()}`
  // convert get url to triples
  let triples = await _handler(id, url)
  // insert triples to store
  await insert({domain, triples})
  // return view_id in response
  let response = new Response(id)
  // allow CORS from domain origin
  response.headers.append('Access-Control-Allow-Origin', domain)
  // return response
  return response
}
