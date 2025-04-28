import { error } from '@sveltejs/kit'
import normalizeUrl from 'normalize-url'
import { queryBoolean } from "$lib/query"

const checkDomain = async (domain) => {
  if (!domain) {
    throw error(409, {
      message: 'Domain unindentified'
    })
  }

  let domainValid =  await queryBoolean(`
    ASK {
      <${normalizeUrl(domain)}> rdf:type <pushbroom:Domain>
    }
  `)

  console.log(`${normalizeUrl(domain)} is valid:`, domainValid)

  if (!domainValid) {
    throw error(401, {
      message: 'Unauthorized domain'
    })
  }
}

export default checkDomain