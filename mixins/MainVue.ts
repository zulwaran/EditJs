import Vue from 'vue'
import { IModalOptions } from '~/store/modals/state'

export default Vue.extend({
  methods: {
    ShowModal (payload: IModalOptions) {
      this.$store.dispatch('modals/show', payload)
    },
    SetLoader (value: boolean) {
      this.$store.dispatch('loader/setLoading', value)
    }
  }
})
