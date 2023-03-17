import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { _handler, GET } from './+server.js'
import { subgraph } from '$env/static/private'

const uuid = 'view'
const id = `urn:uuid:${uuid}`
const data = {
  r: 'https://pushbroom.test',
  p: 'https://pushbroom.test/resource',
  w: '1200',
  u: 'urn:uuid:session'
}
const url =  new URL(`https://pushbroom.test/hello?r=${data.r}&p=${data.p}&w=${data.w}&u=${data.u}`)

describe('View request object to RDF Triples handler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.doMock('../../lib/query.js', async () => {
      return {
        insert: () => true,
        queryBoolean: () => true,
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.doUnmock('../../lib/query.js')
  })

  it('converts a url query parameter of a view into triples', async () => {
    const date = new Date(2023, 1, 24, 13)
    const datetime = date.toISOString()
    const timestamp = date.getTime()
    vi.setSystemTime(date)

    let target = `<urn:uuid:session> <https://pushbroom.co/vocabulary#viewed> <urn:uuid:view> .
<urn:uuid:view> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://pushbroom.co/vocabulary#View> .
<urn:uuid:view> <https://pushbroom.co/vocabulary#datetime> "${datetime}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<urn:uuid:view> <https://pushbroom.co/vocabulary#from> "https://pushbroom.test" .
<urn:uuid:view> <https://pushbroom.co/vocabulary#timestamp> "${timestamp}"^^<http://www.w3.org/2001/XMLSchema#integer> .
<urn:uuid:view> <https://pushbroom.co/vocabulary#url> "https://pushbroom.test/resource" .
<urn:uuid:view> <https://pushbroom.co/vocabulary#width> "1200"^^<http://www.w3.org/2001/XMLSchema#integer> .
`
    let triples = await _handler(id, url)
    expect(triples).toBe(target);
  });
});


describe('View GET request function', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {randomUUID: () => uuid})
  })

  it('accepts a URL and returns a view UUID', async () => {
    vi.mock('../../lib/checkDomain.js', async () => {
      return {
        default: () => true
      }
    })

    let response = await GET({url})
    let body = await response.text()
    expect(body).toBe(id)
    expect(response.headers.get('access-control-allow-origin')).toBe(url.origin)
  })
})