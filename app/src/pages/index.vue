<template lang="pug">
  section.container
    template(v-if='isAuthenticated')
      ButtonsAction(@action='signOut')
        template(v-slot:buttonText) SignOut
      div uid: {{ user.id}}
      div nickName: {{ user.nickName}}
      div
        input(type='text' v-model='nickName')
        ButtonsAction(@action='update')
          template(v-slot:buttonText) UPDATE
    template(v-else)
      ButtonsAction(@action='signInGoogle')
        template(v-slot:buttonText) Sign-In Google
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { setCookie, removeCookie } from '@/helpers/cookies'
import ButtonsAction from '@/components/buttons/Action.vue'
import IUsers from '@/types/store/models/users'
import firebase from '@/plugins/firebase'
import 'firebase/auth'

const Users = namespace('models/users')
const Auth = namespace('modules/auth')

@Component({
  components: {
    ButtonsAction
  }
})
export default class extends Vue {
  @Users.Getter('user') user
  @Users.Getter('isAuthenticated') isAuthenticated
  @Users.Action('update') usersUpdate
  @Auth.Action('signInGoogle') authSignInGoogle
  @Auth.Action('signOut') authSignOut

  private nickName: string = ''

  private asyncData({ store }) {
    const user = store.getters['models/users/user']
    return {
      nickName: user ? user.nickName : ''
    }
  }

  private signInGoogle() {
    const _this = this as any
    this.authSignInGoogle().then(() => {
      const currentUser = firebase.auth().currentUser
      if (currentUser) {
        currentUser.getIdToken().then(token => {
          setCookie(_this.$cookies, 'token', token, _this.$isLocalhost)
        })
      }
    })
  }

  private signOut() {
    const _this = this as any
    this.authSignOut().then(() => {
      removeCookie(_this.$cookies, 'token', _this.$isLocalhost)
    })
  }

  private async update() {
    if (this.user.nickName !== this.nickName) {
      const updateUser: IUsers = {
        ...this.user,
        nickName: this.nickName
      }
      await this.usersUpdate(updateUser)
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
