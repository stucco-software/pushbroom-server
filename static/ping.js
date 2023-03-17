/*! pushbroom.c0 0.0.1 */
;(async function (w, document, host) {
  const loc = w.location
  let prev
  const nav = w.navigator

  // Kill requests from bots and spiders
  if (nav.userAgent.search(/(bot|spider|crawl|preview)/gi) > -1) {
    return
  }

  const disable = 'disablePushbroom',
    ael = 'addEventListener',
    rel = 'removeEventListener',
    cache = '/cache?',
    ps = 'pushState',
    sb = 'sendBeacon',
    ls = 'localStorage',
    ci = 'Pushbroom is',
    blocked = ['unblocked', 'blocked'],
    dce = 'pushbroom',
    log = console.log
    c = 'click'

  const block = viaPage => {
    let b = parseFloat(w[ls].getItem(blocked[1]))
    b &&
      viaPage &&
      log(
        ci +
          ' blocked on ' +
          loc.hostname +
          ' - Use pushbroom.blockMe(0) to unblock'
      )
    return b
  }

  const send = (url, viaPage) => {
    if (block(viaPage)) {
      return new Promise(resolve => resolve())
    }
    const xhr = new XMLHttpRequest()
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(xhr.response)
        }
      }
      xhr.open('GET', url)
      xhr.send()
    })
  }

  // const perf = w.performance
  const screen = w.screen

  const url = 'https://' + host
  // const url = 'http://' + host
  const now = () => Date.now()
  const add = () => (duration += now() - snapshot)

  const params = data =>
    Object.keys(data)
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&')

  const beacon = (url, data) => {
    if (block()) {
      return
    }
    if (nav[sb]) {
      nav[sb](url, JSON.stringify(data))
    } else {
      return send(`${url}?${params(data)}`)
    }
  }

  let start, snapshot, duration, data

  const pageview = async () => {
    if (w[disable]) {
      delete w[disable]
      return
    }
    delete w[disable]

    start = now()
    snapshot = start
    duration = 0

    // set data package
    data = {
      r: document.referrer,
      w: screen.width,
      p: loc.href,
    }

    data.r ? data.r = data.r : data.r = prev
    let h = loc.hostname
    let p = loc.pathname

    await Promise.all([
      send(url + cache + h).then(u => {
        data.u = u
      })
    ])
    prev = data.p
    send(url + '/hello?' + params(data), true).then(r => {
      w.vid = r
    })
  }

  document[ael]('visibilitychange', () => {
    document.hidden ? add() : (snapshot = now())
  })

  const sendDuration = async () => {
    if (w[disable]) {
      return
    }
    !document.hidden ? add() : null
    await beacon(url + '/duration', { d: duration, v: vid })
  }
  // log the pageview duration
  w[ael]('beforeunload', sendDuration)

  let _pushState = function (type) {
    let original = history[type]
    return function () {
      let r = original.apply(this, arguments),
        e
      if (typeof Event == 'function') {
        e = new Event(type)
      } else {
        e = doc.createEvent('Event')
        e.initEvent(type, true, true)
      }
      e.arguments = arguments
      w.dispatchEvent(e)
      return r
    }
  }

  w.history[ps] = _pushState(ps)
  w[ael](ps, () => {
    sendDuration()
    pageview()
  })

  let listener = e => e.target.dataset[dce] && pushbroom.event(Object.assign({}, e.target.dataset))

  // add global object for capturing events
  w.pushbroom = {
    async event(value, callback) {
      add()
      const data = {
        e: value,
        v: vid,
        s: c,
        d: duration
      }
      await beacon(url + '/event', data)
      callback && callback()
    },
    initEvents() {
      w.addEventListener(c, listener)
    },
    blockMe(v) {
      v = v ? 1 : 0
      w[ls].setItem(blocked[1], v)
      log(ci + ' now ' + blocked[v] + ' on ' + loc.hostname)
    },
  }
  pageview()
  pushbroom.initEvents()
})(window, document, 'https://ping.pushbroom.co')
