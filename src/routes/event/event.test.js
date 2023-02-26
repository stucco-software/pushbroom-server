import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const uuid = 'event'
const id = `urn:uuid:${uuid}`
const date = new Date(2023, 1, 24, 13)
const datetime = date.toISOString()
const timestamp = date.getTime()

describe('Unpack nested and namespaced objects', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('attaches events in the `pushbroom` namespace', async () => {
    const { _unpack } = await import('./+server.js')

    let event = {
      key: 'val'
    }

    let obj = {
      pushbroom: 'some string okay',
      pushbroomDataAttr: 'found this on the DOM',
      pushbroomObj: {
        cool: 'string',
        nested: {
          string: 'neat'
        }
      }
    }

    let target = {
      key: 'val',
      event: 'some string okay',
      'dataattr': 'found this on the DOM',
      'obj': {
        cool: 'string',
        nested: {
          string: 'neat'
        }
      }
    }

    let result = _unpack({event, obj})

    expect(result).toStrictEqual(target);

  })

  it('Flattens a deeply nested data object to the event object', async () => {
    const { _unpack } = await import('./+server.js')

    let event = {
      key: 'val'
    }
    let obj = {
      wow: 420,
      cool: {
        nested: {
          truy: {
            madly: {
              deeply: 'string'
            }
          }
        }
      }
    }

    let target = {
      key: 'val',
      'wow': 420,
      'cool': {
        nested: {
          truy: {
            madly: {
              deeply: 'string'
            }
          }
        }
      }
    }
    let result = _unpack({event, obj})
    expect(result).toStrictEqual(target);
  });
});

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
