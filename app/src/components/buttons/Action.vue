<template lang="pug">
  button(@click='action')
    slot(name='buttonText')
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'nuxt-property-decorator'

@Component
export default class Counter extends Vue {
  @Emit()
  action() {}
}
</script>
