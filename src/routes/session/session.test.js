import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const uuid = 'session'
const id = `urn:uuid:${uuid}`

describe('Session request body to RDF Triples', () => {

  it('converts an simple key:val into triples', async () => {
    let data = {
      sid: id,
      c: 'some context'
    }

    let target = `<urn:uuid:session> <https://pushbroom.co/vocabulary/customEvents#context> "some context" .
`

    const { _handler } = await import('./+server.js')
    let triples = await _handler(data)
    expect(triples).toBe(target);
  })

  it('converts an context object into triples', async () => {
    let data = {
      sid: id,
      c: {
        testGroup: 'control',
        placebo: true
      }
    }

    let target = `<urn:uuid:session> <https://pushbroom.co/vocabulary/customEvents#placebo> "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .
<urn:uuid:session> <https://pushbroom.co/vocabulary/customEvents#testgroup> "control" .
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
          sid: id,
          c: {
            testGroup: 'control',
            placebo: true
          }
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
    vi.doUnmock('../../lib/checkDomain.js')

    expect(code).toBe('200')
    expect(response.headers.get('access-control-allow-origin')).toBe(url.origin);
  })
})