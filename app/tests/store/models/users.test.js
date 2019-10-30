import Vuex from 'vuex'
import { cloneDeep } from 'lodash'
import { createLocalVue } from '@vue/test-utils'
import db from '@/plugins/firestore'
import users from '@/store/models/users.ts'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('store/models/users.ts', () => {
  let store
  let user

  beforeAll(() => {
    db.autoFlush()
  })

  beforeEach(async () => {
    // create store
    store = new Vuex.Store({
      modules: {
        'models/users': cloneDeep(users)
      }
    })

    // mock data
    user = {
      nickName: 'alice',
      createdAt: '2019-10-26 00:00:00',
      updatedAt: '2019-10-26 00:00:00'
    }

    await db
      .collection('users')
      .doc('alice')
      .set(user)
  })

  afterEach(async () => {
    await db
      .collection('users')
      .get()
      .then(snapShot => {
        snapShot.forEach(doc => {
          db.collection('users')
            .doc(doc.id)
            .delete()
        })
      })
  })

  describe('getters', () => {
    test('user', () => {
      store.commit('models/users/SET_USER', user)
      expect(store.getters['models/users/user']).toMatchObject(user)
    })

    describe('isAuthenticated', () => {
      test('true', async () => {
        await store.dispatch('models/users/set', 'alice')
        expect(store.getters['models/users/isAuthenticated']).toBeTruthy()
      })
      test('false:not exists', async () => {
        await store.dispatch('models/users/unset')
        expect(store.getters['models/users/isAuthenticated']).toBeFalsy()
      })
    })
  })

  describe('mutations', () => {
    test('UNSET_USER', () => {
      store.commit('models/users/UNSET_USER')
      expect(store.getters['models/users/user']).toMatchObject({})
    })
  })

  describe('actions', () => {
    test('set', async () => {
      await store.dispatch('models/users/set', 'alice')
      expect(store.getters['models/users/user']).toMatchObject(user)
    })

    test('unset', async () => {
      await store.dispatch('models/users/unset')
      expect(store.getters['models/users/user']).toMatchObject({})
    })

    test('create', async () => {
      await store.dispatch('models/users/create', 'bob')
      const checkData = {
        id: 'bob',
        nickName: ''
      }
      expect(store.getters['models/users/user']).toMatchObject(checkData)
    })

    test('update', async () => {
      const updateData = {
        id: 'alice',
        nickName: 'test'
      }
      await store.dispatch('models/users/update', updateData)
      const data = store.getters['models/users/user']
      expect(data).toMatchObject(updateData)
      expect(data.updatedAt).not.toBe(user.updatedAt)
    })
  })
})
