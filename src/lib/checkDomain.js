import { error } from '@sveltejs/kit'
import { queryBoolean } from "$lib/query"

const checkDomain = async (domain) => {
  if (!domain) {
    throw error(409, {
      message: 'Domain unindentified'
    })
  }

  let domainValid =  await queryBoolean(`
    ASK {
      <${domain}> rdf:type <pushbroom:Domain>
    }
  `)

  if (!domainValid) {
    throw error(401, {
      message: 'Unauthorized domain'
    })
  }
}

export default checkDomain