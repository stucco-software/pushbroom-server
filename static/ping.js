!async function(w, document, host) {
  if (w.navigator.userAgent.search(/(bot|spider|crawl|preview)/gi) > -1) {
    return
  }

  let session
  let event
  let blocked = w.localStorage.getItem('pushbroom:blocked')

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
    let url = `${host}/event?type=${type}&${params(data)}&session=${session}&previous=${event}`
    return get(url)
  }

  const cache = () => {
    let url = `${host}/cache`
    return get(url)
  }

  const getData = (e) => e.getAttributeNames().filter(ns => ns.startsWith('pb:') || ns === 'url').reduce((o, key) => ({ ...o, [key]: e.getAttribute(key)}), {})

  const pageview = async () => {
    event = await send('Pageview', getData(document.querySelector('pushbroom')))
  }

  let callback = (e, o) => {
    if (e[0].isIntersecting) {
      send(e[0].target.dataset.pushbroom, getData(e[0].target))
    }
  }

  let mobserver = new MutationObserver(pageview)
  let iobserver = new IntersectionObserver(callback)
  document.querySelectorAll('[data-pushbroom]').forEach(n => iobserver.observe(n))
  document.querySelectorAll('pushbroom').forEach(n => mobserver.observe(n, {attributes: true}))

  let clicker = e => {
    if (!e.target.dataset['pushbroom:click']) return
    send(e.target.dataset['pushbroom:click'], getData(e.target))
  }

  w.pushbroom = {
    block(v) {
      if (!blocked) {
        blocked = true
        w.localStorage.setItem('pushbroom:blocked', true)
      } else {
        blocked = null
        w.localStorage.removeItem('pushbroom:blocked')
      }
    }
  }

  w.addEventListener('click', clicker)

  session = await cache()
  await pageview()

}(window, document, 'https://ping.pushbroom.co');

