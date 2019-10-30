export default ({ app, req }, inject) => {
  let host = ''
  if (process.server) {
    host = req.headers.host
  } else {
    host = window.location.host
  }
  const isLocalhost = host.includes('localhost:')
  app.isLocalhost = isLocalhost
  inject('isLocalhost', isLocalhost)
}
