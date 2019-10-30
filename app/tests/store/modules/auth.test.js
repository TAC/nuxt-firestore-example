import 'firebase/auth'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'
import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import firebase from '@/plugins/firebase'
import db from '@/plugins/firestore'
import auth from '@/store/modules/auth.ts'
import users from '@/store/models/users.ts'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('store/modules/auth.ts', () => {
  let store
  let authUser
  let user

  beforeAll(() => {
    firebase.auth().autoFlush()
    db.autoFlush()
  })

  beforeEach(async () => {
    // create store
    store = new Vuex.Store({
      modules: {
        'modules/auth': cloneDeep(auth),
        'models/users': cloneDeep(users)
      }
    })

    // mock data
    user = {
      nickName: 'alice',
      createdAt: '2019-10-26 00:00:00',
      updatedAt: '2019-10-26 00:00:00'
    }

    authUser = {
      uid: 'alice',
      email: 'alice@mail.com'
    }

    // user collection
    await db
      .collection('users')
      .doc(authUser.uid)
      .set(user)
  })

  describe('actions', () => {
    describe('signIn', () => {
      test('sccess: new user', async () => {
        const newUser = {
          uid: 'bob',
          email: 'bob@mail.com'
        }
        firebase.auth().signInWithPopup = jest.fn(provider => {
          return new Promise(resolve => {
            authUser.providerData = [provider]
            resolve({
              user: newUser,
              additionalUserInfo: {
                isNewUser: true
              }
            })
          })
        })

        const provider = new firebase.auth.GoogleAuthProvider()
        await store.dispatch('modules/auth/signIn', provider)
        await flushPromises()

        const checkUser = {
          id: 'bob',
          nickName: ''
        }
        const result = store.getters['models/users/user']
        expect(result).toMatchObject(checkUser)
      })

      test('sccess: exists user', async () => {
        firebase.auth().signInWithPopup = jest.fn(provider => {
          return new Promise(resolve => {
            authUser.providerData = [provider]
            resolve({
              user: authUser,
              additionalUserInfo: {
                isNewUser: false
              }
            })
          })
        })

        const provider = new firebase.auth.GoogleAuthProvider()
        await store.dispatch('modules/auth/signIn', provider)
        await flushPromises()

        const result = store.getters['models/users/user']
        expect(result).toMatchObject(user)
      })

      test('failure', async () => {
        firebase.auth().signInWithPopup = jest.fn(_ => {
          return Promise.reject(new Error('error'))
        })

        const provider = new firebase.auth.GoogleAuthProvider()
        await expect(
          store.dispatch('modules/auth/signIn', provider)
        ).rejects.toThrow()
      })
    })

    test('signInGoogle', async () => {
      firebase.auth().signInWithPopup = jest.fn(provider => {
        return new Promise(resolve => {
          authUser.providerData = [provider]
          resolve({
            user: authUser,
            additionalUserInfo: {
              isNewUser: false
            }
          })
        })
      })

      await store.dispatch('modules/auth/signInGoogle')
      await flushPromises()

      const result = store.getters['models/users/user']
      expect(result).toMatchObject(user)
    })

    test('isSignIn', async () => {
      // initialize auth
      firebase
        .auth()
        .createUser(authUser)
        .then(data => {
          firebase.auth().changeAuthState(data)
        })

      await store.dispatch('modules/auth/isSignIn')
      const result = store.getters['models/users/user']
      expect(result).toMatchObject(user)
    })

    test('signOut', async () => {
      // initialize auth
      firebase
        .auth()
        .createUser(authUser)
        .then(data => {
          firebase.auth().changeAuthState(data)
        })

      await store.dispatch('modules/auth/signOut')
      const result = store.getters['models/users/user']
      expect(result).toMatchObject({})
    })
  })
})
