import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { subgraph } from '$env/static/private'

const date = new Date(2023, 1, 24, 14)
const datetime = date.toISOString()
const timestamp = date.getTime()


describe('Attaches a duration and endtime to a view', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('converts an object into triples', async () => {
    vi.setSystemTime(date)
    let data = {
      vid: 'urn:uuid:view',
      d: '6000'
    }

    let target = `<urn:uuid:view> <https://pushbroom.co/vocabulary#duration> "6000"^^<http://www.w3.org/2001/XMLSchema#integer> .
<urn:uuid:view> <https://pushbroom.co/vocabulary/customEvents#end_timestamp> "1677276000000"^^<http://www.w3.org/2001/XMLSchema#integer> .
`
    const { _handler } = await import('./+server.js')
    let triples = await _handler(data)
    expect(triples).toBe(target);
  })
})

describe('Event POST response', () => {
  it('Reponds to a request with a 200 and correct CORS headers', async () => {

    vi.doMock('../../lib/query.js', async (importOriginal) => {
      return {
        insert: () => true
      }
    })

    let request = {
      json: () => {
        return {
          vid: 'urn:uuid:view',
          d: '6000'
        }
      }
    }

    const { POST } = await import('./+server.js')

    let response = await POST({request})
    let code = await response.text()

    vi.doUnmock('../../lib/query.js')
    expect(code).toBe('200')
    expect(response.headers.get('access-control-allow-origin')).toBe(subgraph);
  })
})