!async function(w, document, host) {
  if (w.navigator.userAgent.search(/(bot|spider|crawl|preview)/gi) > -1) {
    return
  }

  let pushbroom = 'pushbroom',
      ls = 'localStorage',
      t = 'target',
      blocked = w[ls].getItem(`${pushbroom}:blocked`),
      event,
      session

  const params = data =>
    Object.keys(data)
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&')

  const get = (url) => {
    if (blocked) {
      return new Promise((resolve, reject) => {})
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

  const send = (type, data) => {
    let url = `${host}/ping?type=${type}&${params(data)}&session=${session}&previous=${event}`
    return get(url)
  }

  const cache = () => {
    let url = `${host}/cache`
    return get(url)
  }

  const getData = (e) => e.getAttributeNames().filter(ns => ns.startsWith('pb:') || ns === 'url').reduce((o, key) => ({ ...o, [key]: e.getAttribute(key)}), {})

  const pageview = async (n) => {
    if (n) { event = await send('View', getData(n)) }

  }

  let callback = (e, o) => {
    e
      .filter(n => n.isIntersecting)
      .forEach(n => send(n[t].dataset[pushbroom], getData(n[t])))
  }

  let iobserver = new IntersectionObserver(callback)

  const domchange = (arr, o) => {
    arr
      .filter(e => e[t].getAttribute(`data-${pushbroom}`))
      .forEach(n => {
        iobserver.observe(n[t])
      })

    document
      .querySelectorAll(pushbroom)
      .forEach(n => {
        pageview(n)
      })
  }

  let entireDomObserver = new MutationObserver(domchange)
  entireDomObserver.observe(document.body, {subtree: true, childList: true})

  let clicker = e => {
    if (!e[t].dataset[`${pushbroom}:click`]) return
    send(e[t].dataset[`${pushbroom}:click`], getData(e[t]))
  }

  w[pushbroom] = {
    block(v) {
      if (!blocked) {
        blocked = true
        w[ls].setItem(`${pushbroom}:blocked`, true)
      } else {
        blocked = null
        w[ls].removeItem(`${pushbroom}:blocked`)
      }
    }
  }

  w.addEventListener('click', clicker)

  session = await cache()
  await pageview()

}(window, document, 'http://localhost:5173');