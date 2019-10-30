import firebase from '@/plugins/firebase'
import 'firebase/auth'
import { setCookie } from '@/helpers/cookies'

export default async function({ store, app }) {
  await store.dispatch('modules/auth/isSignIn')

  const currentUser = firebase.auth().currentUser
  if (currentUser) {
    currentUser.getIdToken().then(token => {
      setCookie(app.$cookies, 'token', token, app.$isLocalhost)
    })
  }
}
