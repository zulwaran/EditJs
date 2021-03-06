import { MutationTree } from 'vuex'
import { ITokensMap, ITokenState } from '~/store/token/state'

const mutations: MutationTree<ITokenState> = {
  SET_TOKENS_MAP: (state, payload: ITokensMap) => (state.tokensMap = {
    ...state.tokensMap,
    ...payload
  }),
  SET_TOKEN_PROPS: (state, { address, value }: { address: string, value: Record<string, unknown>}) => {
    const token = state.tokensMap[address]
    const keys = Object.keys(value)
    for (const key of keys) {
      token[key] = value[key]
    }
    state.tokensMap = {
      ...state.tokensMap,
      [address]: token
    }
  }
}

export default mutations
