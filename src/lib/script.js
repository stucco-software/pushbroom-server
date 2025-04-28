!async function(w, document, host, pkey) {
  console.log('lets go ping!', host, pkey)
  if (w.navigator.userAgent.search(/(bot|spider|crawl|preview)/gi) > -1) {
    return
  }

  let pushbroom = 'pushbroom',
      ls = 'localStorage',
      t = 'target',
      ds = 'dataset',
      fe = 'forEach',
      f = 'filter',
      blocked = w[ls].getItem(`${pushbroom}:blocked`),
      event
      // session

  const params = data =>
    Object.keys(data)
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&')

  const get = (url) => {
    if (blocked) {
      return new Promise(() => {})
    }
    const xhr = new XMLHttpRequest()
    return new Promise((resolve) => {
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
    console.log(`send data!`)
    // let url = `${host}/ping?t=${type}&${params(data)}&s=${session}&p=${event}&pkey=${pkey}`
    let url = `${host}/ping?t=${type}&${params(data)}&p=${event}&pkey=${pkey}`
    return get(url)
  }

  // const cache = () => {
  //   let url = `${host}/cache?pkey=${pkey}`
  //   return get(url)
  // }

  const getData = (e) => e.getAttributeNames()[f](ns => ns.startsWith('pb:') || ns === 'url').reduce((o, key) => ({ ...o, [key]: e.getAttribute(key)}), {})

  const pageview = async (n) => {
    console.log(`send pageview!`, n)
    if (n) {
      console.log(`this is in-memory, and hard page loads will wipe it out`)
      event = await send('View', getData(n))
      console.log(event)
    }
  }

  let callback = (e, o) => {
    e
      [f](n => n.isIntersecting)
      [fe](n => send(n[t][ds][pushbroom], getData(n[t])))
  }

  let iobserver = new IntersectionObserver(callback)

  const domchange = (arr) => {
    console.log(`dom change!`, arr)
    arr
      [f](e => e[t].getAttribute(`data-${pushbroom}`))
      [fe](n => {
        console.log(`ping?`)
        iobserver.observe(n[t])
      })

    console.log(arr[f](e => e[t].getAttribute(`data-${pushbroom}`)))
    document
      .querySelectorAll(pushbroom)
      [fe](n => {
        console.log(`I see things!`)
        pageview(n)
      })
  }

  let entireDomObserver = new MutationObserver(domchange)
  entireDomObserver.observe(document.body, {subtree: true, childList: true})

  let clicker = e => {
    if (!e[t][ds][`${pushbroom}:click`]) return
    send(e[t][ds][`${pushbroom}:click`], getData(e[t]))
  }

  w[pushbroom] = {
    block(v) {
      if (!blocked) {
        blocked = true
        w[ls].setItem(`${pushbroom}:blocked`, blocked)
      } else {
        blocked = null
        w[ls].removeItem(`${pushbroom}:blocked`)
      }
    }
  }

  w.addEventListener('click', clicker)

  // session = await cache()
  // document
  //   .querySelectorAll(pushbroom)
  //   [fe](n => {
  //     console.log(`initial load…`)
  //     pageview(n)
  //   })

}(window, document, "<SERVER_HOST>", "<PUBLIC_KEY>");
