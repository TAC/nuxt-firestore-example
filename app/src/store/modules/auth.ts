import {
  VuexModule,
  Module,
  action,
  getRawActionContext
} from 'vuex-class-component'
import firebase from '@/plugins/firebase'
import 'firebase/auth'

@Module({ namespacedPath: 'modules/auth/', target: 'nuxt' })
class Store extends VuexModule {
  @action({ mode: 'raw' })
  public async signIn(provider) {
    const context = getRawActionContext(this)
    context.commit('models/users/UNSET_USER', null, { root: true })
    await firebase
      .auth()
      .signInWithPopup(provider)
      .then(async result => {
        if (result && result.user && result.additionalUserInfo) {
          if (result.additionalUserInfo.isNewUser) {
            // new user
            await context.dispatch('models/users/create', result.user.uid, {
              root: true
            })
          } else {
            // exists user
            await context.dispatch('models/users/set', result.user.uid, {
              root: true
            })
          }
        }
      })
      .catch(error => {
        console.error(error)
        throw error
      })
  }

  @action({ mode: 'raw' })
  public async signInGoogle() {
    const context = getRawActionContext(this)
    const provider = new firebase.auth.GoogleAuthProvider()
    await context.dispatch('signIn', provider)
  }

  @action({ mode: 'raw' })
  public async signOut() {
    const context = getRawActionContext(this)
    await firebase
      .auth()
      .signOut()
      .then(async () => {
        await context.dispatch('models/users/unset', null, {
          root: true
        })
      })
  }

  @action({ mode: 'raw' })
  public isSignIn() {
    const context = getRawActionContext(this)
    return new Promise(resolve => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
        unsubscribe()
        if (user) {
          await context.dispatch('models/users/set', user.uid, { root: true })
        }
        resolve(user || false)
      })
    })
  }
}

export default Store.ExtractVuexModule(Store)
