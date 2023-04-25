const params = () => {}

const send = () => {}

const fn = (type, args) => {
  let data = {
    type,
    ...args
  }
  send(`/event?${params(data)}`)
}

export default fn