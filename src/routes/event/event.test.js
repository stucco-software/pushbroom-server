import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { subgraph } from '$env/static/private'

const uuid = 'event'
const id = `urn:uuid:${uuid}`
const date = new Date(2023, 1, 24, 13)
const datetime = date.toISOString()
const timestamp = date.getTime()

describe('Event request body to RDF Triples', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('converts an object into triples', async () => {
    vi.setSystemTime(date)
    let data = {
      v: 'https://pushbroom.test',
      e: 'some cool data string'
    }

    let target = `<urn:uuid:event> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://pushbroom.co/vocabulary#Event> .
<urn:uuid:event> <https://pushbroom.co/vocabulary#datetime> "2023-02-24T21:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<urn:uuid:event> <https://pushbroom.co/vocabulary#source> <https://pushbroom.test> .
<urn:uuid:event> <https://pushbroom.co/vocabulary#timestamp> "1677272400000"^^<http://www.w3.org/2001/XMLSchema#integer> .
<urn:uuid:event> <https://pushbroom.co/vocabulary/customEvents#> "some cool data string" .
`

    const { _handler } = await import('./+server.js')
    let triples = await _handler(id, data)
    expect(triples).toBe(target);
  })

  it('converts an object with an event data object into triples', async () => {
    vi.setSystemTime(date)
    let data = {
      v: 'https://pushbroom.test',
      e: {
        pushbroom: 'Default value',
        pushbroomDataAttr: 'found this on the DOM',
        another: 'value',
        nested: {
          "string": "wow"
        }
      }
    }

    let target = `<urn:uuid:event> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://pushbroom.co/vocabulary#Event> .
<urn:uuid:event> <https://pushbroom.co/vocabulary#datetime> "2023-02-24T21:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<urn:uuid:event> <https://pushbroom.co/vocabulary#source> <https://pushbroom.test> .
<urn:uuid:event> <https://pushbroom.co/vocabulary#timestamp> "1677272400000"^^<http://www.w3.org/2001/XMLSchema#integer> .
<urn:uuid:event> <https://pushbroom.co/vocabulary/customEvents#> "Default value" .
<urn:uuid:event> <https://pushbroom.co/vocabulary/customEvents#another> "value" .
<urn:uuid:event> <https://pushbroom.co/vocabulary/customEvents#dataattr> "found this on the DOM" .
<urn:uuid:event> <https://pushbroom.co/vocabulary/customEvents#nested> _:b0 .
_:b0 <https://pushbroom.co/vocabulary/customEvents#string> "wow" .
`

    const { _handler } = await import('./+server.js')
    let triples = await _handler(id, data)
    expect(triples).toBe(target);
  })
})

describe('Event POST response', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {randomUUID: () => uuid})
  })

  it('Reponds to a request with a 200 and correct CORS headers', async () => {

    vi.doMock('../../lib/query.js', async (importOriginal) => {
      return {
        insert: () => true,
        queryBoolean: () => true,
      }
    })

    vi.mock('../../lib/checkDomain.js', async () => {
      return {
        default: () => true
      }
    })

    let request = {
      json: () => {
        return {
          v: 'https://pushbroom.test',
          e: 'neat event string'
        }
      }
    }
    let url = {
      origin: "http://pushbroom.test"
    }

    const { POST } = await import('./+server.js')

    let response = await POST({request, url})
    let code = await response.text()

    vi.doUnmock('../../lib/query.js')
    expect(code).toBe('200')
    expect(response.headers.get('access-control-allow-origin')).toBe(url.origin);
  })
})



