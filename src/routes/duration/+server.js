import context from '$lib/context'
import jsonld from "jsonld"
import { insert } from "$lib/query"
import checkDomain from '$lib/checkDomain'

export const _handler = async (data) => {
  const date = new Date()
  // create event object
  let event = {
    '@context': context,
    id: data.vid,
    duration: data.d,
    end_timestamp: date.getTime()
  }
  return await jsonld.toRDF(event, {format: 'application/n-quads'});
}

export async function POST({ request, url }) {
  let domain = request.headers.get('origin')
  await checkDomain(domain)

  // get the ppost body
  const data = await request.json()
  // create uuid for event
  // convert get url to triples
  let triples = await _handler(data)
  // insert triples to store

  await insert({domain, triples})
  // return 200 in response
  let response = new Response(200)
  response.headers.append('Access-Control-Allow-Origin', domain)

  return response
}