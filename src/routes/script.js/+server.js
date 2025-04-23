import script from '$lib/script.js?raw'
let host = "http://localhost:5174"

export async function GET({ request, url }) {
  console.log(`get the script with vars inserted for pkey`)
  console.log(script)

  let pkey = url.searchParams.get('pkey')
  let hydrated = script
    .replace('<SERVER_HOST>', `${host}`)
    .replace('<PUBLIC_KEY>', `${pkey}`)
  return new Response(String(hydrated))
}