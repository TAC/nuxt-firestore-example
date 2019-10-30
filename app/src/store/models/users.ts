import {
  VuexModule,
  Module,
  getter,
  mutation,
  action,
  getRawActionContext
} from 'vuex-class-component'
import firebase from '@/plugins/firebase'
import db from '@/plugins/firestore'
import Users from '@/types/store/models/users'

const timestamp = firebase.firestore.FieldValue.serverTimestamp()

@Module({ namespacedPath: 'models/users/', target: 'nuxt' })
class Store extends VuexModule {
  @getter user: Users = {}

  get isAuthenticated() {
    return !!this.user.id
  }

  @mutation
  public SET_USER(payload: Users) {
    this.user = payload
  }

  @mutation
  public UNSET_USER() {
    this.user = {}
  }

  @action({ mode: 'raw' })
  public async set(uid: string) {
    if (uid) {
      const ref = db.collection('users').doc(uid)
      const doc = await ref.get()
      if (doc.exists) {
        const data = doc.data()
        if (data) {
          const user: Users = {
            id: doc.id,
            nickName: data.nickName,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          }
          const context = getRawActionContext(this)
          context.commit('SET_USER', user)
        }
      }
    }
  }

  @action({ mode: 'raw' })
  public async unset() {
    const context = getRawActionContext(this)
    context.commit('UNSET_USER')
  }

  @action({ mode: 'raw' })
  public async create(uid: string) {
    if (uid) {
      const ref = db.collection('users').doc(uid)
      const doc = await ref.get()
      if (!doc.exists) {
        const nickName = ''
        await ref.set({
          nickName,
          createdAt: timestamp,
          updatedAt: timestamp
        })

        const data: Users = {
          id: uid,
          nickName
        }
        const context = getRawActionContext(this)
        context.commit('SET_USER', data)
      }
    }
  }

  @action({ mode: 'raw' })
  public async update(user: Users) {
    const ref = db.collection('users').doc(user.id)
    const doc = await ref.get()
    if (doc.exists) {
      await ref.update({
        nickName: user.nickName,
        updatedAt: timestamp
      })
      const context = getRawActionContext(this)
      context.commit('SET_USER', user)
    }
  }
}

export default Store.ExtractVuexModule(Store)
