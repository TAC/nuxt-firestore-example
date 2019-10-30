import { NuxtCookies } from 'cookie-universal-nuxt'

const _OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
  secure: true
}

export function getCookie(cookies: NuxtCookies, name: string): string {
  const data = deserialize(cookies.get('__session'))
  return data[name]
}

export function setCookie(
  cookies: NuxtCookies,
  name: string,
  value: string,
  isLocalhost: boolean
) {
  const data = deserialize(cookies.get('__session'))
  data[name] = value
  _OPTIONS.secure = !isLocalhost
  cookies.set('__session', serialize(data), _OPTIONS)
}

export function removeCookie(
  cookies: NuxtCookies,
  name: string,
  isLocalhost: boolean
) {
  const data = deserialize(cookies.get('__session'))
  delete data[name]
  _OPTIONS.secure = !isLocalhost
  cookies.set('__session', serialize(data), _OPTIONS)
}

function serialize(obj: Object): string {
  try {
    const str = JSON.stringify(obj, function replacer(_, v) {
      if (typeof v === 'function') {
        return v.toString()
      }
      return v
    })
    return str
  } catch (e) {
    return ''
  }
}

function deserialize(str: string): Object {
  try {
    const obj = JSON.parse(str, function reciever(_, v) {
      if (typeof v === 'string' && v.startsWith('function')) {
        return Function.call(this, 'return ' + v)()
      }
      return v
    })
    return obj
  } catch (e) {
    return {}
  }
}
