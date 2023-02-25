import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Record sessions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
  })

  it('creates a new session if no cache header is present', async () => {
    const date = new Date(2023, 1, 24, 13)
    const datetime = date.toISOString()
    const timestamp = date.getTime()
    vi.setSystemTime(date)

    let id = 'urn:uuid:session'
    let request = new Request(`https://pushbroom.dev/cache`, {
      method: 'GET',
      headers: new Headers({
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0'
      })
    })
    const { _handler } = await import('./+server.js')

    let triples = await _handler(id, request)
    let target = `<urn:uuid:session> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://pushbroom.co/vocabulary#Session> .
<urn:uuid:session> <https://pushbroom.co/vocabulary#browser> "Firefox" .
<urn:uuid:session> <https://pushbroom.co/vocabulary#browserVersion> "111.0.0" .
<urn:uuid:session> <https://pushbroom.co/vocabulary#datetime> "${datetime}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<urn:uuid:session> <https://pushbroom.co/vocabulary#operatingSystem> "Mac OS X 10.15.0" .
<urn:uuid:session> <https://pushbroom.co/vocabulary#timestamp> "${timestamp}"^^<http://www.w3.org/2001/XMLSchema#integer> .
`

    expect(triples).toBe(target);
  });

  it('returns triples is cache header is present and expired', async () => {
    const date = new Date(2023, 1, 24, 13)
    const datetime = date.toISOString()
    const timestamp = date.getTime()
    vi.setSystemTime(date)

    vi.doMock('../../lib/query.js', async () => {
      return {
        queryBoolean: () => true,
      }
    })

    let id = 'urn:uuid:session'
    let request = new Request(`https://pushbroom.dev/cache`, {
      method: 'GET',
      headers: new Headers({
        'if-none-match': id,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0'
      })
    })

    const { _handler } = await import('./+server.js')
    let triples = await _handler(id, request)
    let target = `<urn:uuid:session> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://pushbroom.co/vocabulary#Session> .
<urn:uuid:session> <https://pushbroom.co/vocabulary#browser> "Firefox" .
<urn:uuid:session> <https://pushbroom.co/vocabulary#browserVersion> "111.0.0" .
<urn:uuid:session> <https://pushbroom.co/vocabulary#datetime> "${datetime}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<urn:uuid:session> <https://pushbroom.co/vocabulary#operatingSystem> "Mac OS X 10.15.0" .
<urn:uuid:session> <https://pushbroom.co/vocabulary#timestamp> "${timestamp}"^^<http://www.w3.org/2001/XMLSchema#integer> .
`
    vi.doUnmock('../../lib/query.js')
    expect(triples).toBe(target);
  });

  it('returns null triples is cache header is present and unexpired', async () => {
    const date = new Date(2023, 1, 24, 13)
    const datetime = date.toISOString()
    const timestamp = date.getTime()
    vi.setSystemTime(date)

    vi.doMock('../../lib/query.js', async (importOriginal) => {
      return {
        queryBoolean: () => false,
      }
    })
    const { _handler } = await import('./+server.js')
    let id = 'urn:uuid:session'
    let request = new Request(`https://pushbroom.dev/cache`, {
      method: 'GET',
      headers: new Headers({
        'if-none-match': id,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0'
      })
    })
    let triples = await _handler(id, request)
    let target
    vi.doUnmock('../../lib/query.js')
    expect(triples).toBe(target);
  });
});
