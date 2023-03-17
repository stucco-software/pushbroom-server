import { sparql_endpoint, sparql_user, sparql_password } from '$env/static/private'
import jsonld from 'jsonld'
import context from '$lib/context'
import prefixes from '$lib/prefixes'

const headers = new Headers()
headers.set('Authorization', 'Basic ' + btoa(sparql_user + ":" + sparql_password));

const getTriples = (accept) => async (query) => await fetch(`${sparql_endpoint}/query`, {
  method: 'POST',
  headers: headers,
  body: new URLSearchParams({
    'query': `${prefixes}
    ${query}`
  })
})

export const queryJSON = async query => {
  let triples = await getTriples('application/n-triples')(query)
    .then(result => result.text())
  const doc = await jsonld.fromRDF(triples, {format: 'application/n-quads'});
  const compact = await jsonld.compact(doc, context)
  delete compact['@context']
  if (Object.keys(compact).length < 1) {
    return []
  }
  if (compact['@graph']) {
    return compact['@graph']
  }
  return [compact]
}

export const queryArr = async query => {
  let triples = await getTriples('application/sparql-results+json')(query)
      .then(result => result.json())
  return triples
}

export const queryBoolean = async query => {
  let triples = await getTriples('application/sparql-results+json')(query)
  let json = await triples.json()
  return json.boolean
}

export const insert = async ({domain, triples}) => await fetch(`${sparql_endpoint}/update`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(sparql_user + ":" + sparql_password),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'update': `insert data {
        graph <${domain}> {
${triples}
        }
      }`
    })
  }).catch((error) => {
    console.error('Error:', error);
  }
);