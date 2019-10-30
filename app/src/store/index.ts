import jwtDecode from 'jwt-decode'
import { getCookie } from '@/helpers/cookies'

export const actions = {
  nuxtServerInit: async ({ dispatch }, { app }) => {
    const token = getCookie(app.$cookies, 'token')
    if (token) {
      const decodedToken = jwtDecode(token)
      await dispatch('models/users/set', decodedToken.user_id)
    }
  }
}
