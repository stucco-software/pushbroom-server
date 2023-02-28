import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Unpack nested and namespaced objects', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('attaches events in the `pushbroom` namespace', async () => {
    const { _unpack } = await import('./unpack.js')

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
    const { _unpack } = await import('./unpack.js')

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
