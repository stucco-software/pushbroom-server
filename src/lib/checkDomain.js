import { error } from '@sveltejs/kit'
import { queryBoolean } from "$lib/query"

const checkDomain = async (domain) => {
  console.log('check domain')
  console.log(domain)
  if (!domain) {
    throw error(409, {
      message: 'Domain unindentified'
    })
  }
  console.log(`ASK {
      <${domain}> rdf:type <pushbroom:Domain>
    }`)
  let domainValid =  await queryBoolean(`
    ASK {
      <${domain}> rdf:type <pushbroom:Domain>
    }
  `)
  console.log(`result: ${domainValid}`)
  if (!domainValid) {
    throw error(401, {
      message: 'Unauthorized domain'
    })
  }
}

export default checkDomain