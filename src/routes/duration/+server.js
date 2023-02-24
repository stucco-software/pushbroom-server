export async function GET({ url }) {
  const query = url.searchParams
  console.log(`Duration GET:`)
  console.log(query)

  return new Response(200)
}

export async function POST({ request }) {
  const query = await request.json()
  console.log(`Duration POST:`)
  console.log(query)

  let response = new Response(200)
  response.headers.append('Access-Control-Allow-Origin', subgraph)

  return response
}