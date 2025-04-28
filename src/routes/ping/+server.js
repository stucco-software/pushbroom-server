import checkDomain from '$lib/checkDomain'
import context from '$lib/context'
import jsonld from "jsonld"
import { insertToPod } from "$lib/solidpod"
import { insert, queryArr } from "$lib/query"

export async function _handler(id, url, domain) {
  const query = url.searchParams
  console.log(query)
  const date = new Date()

  let data = {
    '@context': context,
    id: id,
    datetime: date.toISOString(),
    timestamp: Date.now(),
  }

  // also kind gross but okay
  let objectUrl = query.get('url')
  if (objectUrl) {
    data.url = `${domain}${objectUrl}`
    query.delete('url')
  }

  if (query.get('p') === 'undefined') {
    query.delete('p')
  } else {
    data.p = query.get('p')
  }

  if (query.get('t') !== "View") {
    data.type = 'Event'
  }

  // mutation bad! But okay for right this second
  for (const [key, value] of query) {
    data[key] = encodeURI(value)
  }

  console.log(data)

  return await jsonld.toRDF(data, {format: 'application/n-quads'})
}

const getPodURI = async (domain, pkey) => {
  console.log(`okay where we at bro`)
  let r = await queryArr(`SELECT ?pod WHERE {
    <${domain}> <https://pushbroom.co/vocabulary#publicKey> "${pkey}" .
    <${domain}> <https://pushbroom.co/vocabulary#pod> ?pod .
  }`)
  console.log(r.results.bindings[0].pod.value)
  return r.results.bindings[0].pod.value
}

export async function GET({ request,url }) {
  let domain = request.headers.get('origin')
  const pkey = url.searchParams.get('pkey')
  console.log(`new reqest from domain`, domain, url)
  await checkDomain(domain)

  // create uuid for view
  const id = `urn:uuid:${crypto.randomUUID()}`
  // convert get url to triples
  let triples = await _handler(id, url, domain)

  console.log(`Insert triples to the pod where…`)
  console.log(domain, pkey)
  const pod = await getPodURI(domain, pkey)
  console.log(pod)
  console.log(triples)
  let podResponse = await insertToPod({
    url: pod,
    triples
  })
  console.log(podResponse)
  // insert triples to store
  // await insert({domain, triples})
  // return view_id in response
  let response = new Response(id)
  // allow CORS from domain origin
  response.headers.append('Access-Control-Allow-Origin', domain)
  // return response
  return response
}
