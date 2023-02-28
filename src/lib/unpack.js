export const _unpack = ({event, obj}) => {
  let keys = [...Object.keys(obj)]
  let newObject = Object.assign(event, {})
  keys.forEach(key => {
    if (key === 'pushbroom') {
      // can be abstracted with below but brain not right now
      try {
        let json = JSON.parse(obj[key])
        newObject[`event`] = json
        _unpack({event: json, obj: json})
      } catch {
        newObject[`event`] = obj[key]
      }
    } else {
      let shortKey = key.replace('pushbroom', '').toLowerCase()
      // can be abstracted with above but brain not right now
      try {
        let json = JSON.parse(obj[key])
        newObject[shortKey] = json
        _unpack({event: json, obj: json})
      } catch {
        newObject[shortKey] = obj[key]
      }
    }
  })
  return newObject
}