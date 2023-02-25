import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { _handler } from './+server.js'

describe('Record views', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('converts a url query parameter of a view into triples', async () => {
    const date = new Date(2023, 1, 24, 13)
    const datetime = date.toISOString()
    const timestamp = date.getTime()
    vi.setSystemTime(date)

    let id = `urn:uuid:view`
    let data = {
      r: 'https://pushbroom.dev',
      p: 'https://pushbroom.dev/resource',
      w: '1200',
      u: 'urn:uuid:session'
    }
    let url =  new URL(`https://pushbroom.dev/hello?r=${data.r}&p=${data.p}&w=${data.w}&u=${data.u}`)

    let target = `<urn:uuid:session> <https://pushbroom.co/vocabulary#viewed> <urn:uuid:view> .
<urn:uuid:view> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://pushbroom.co/vocabulary#View> .
<urn:uuid:view> <https://pushbroom.co/vocabulary#datetime> "${datetime}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<urn:uuid:view> <https://pushbroom.co/vocabulary#from> "https://pushbroom.dev" .
<urn:uuid:view> <https://pushbroom.co/vocabulary#timestamp> "${timestamp}"^^<http://www.w3.org/2001/XMLSchema#integer> .
<urn:uuid:view> <https://pushbroom.co/vocabulary#url> "https://pushbroom.dev/resource" .
<urn:uuid:view> <https://pushbroom.co/vocabulary#width> "1200"^^<http://www.w3.org/2001/XMLSchema#integer> .
`
    let triples = await _handler(id, url)
    expect(triples).toBe(target);
  });
});
