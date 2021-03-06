import Web3 from 'web3'
// @ts-ignore
import Web4 from '@cryptonteam/web4'
import BigNumber from 'bignumber.js'
import { output, error, IResponse } from '~/utils/index'
import { ERC20 } from '~/utils/abis'

const { IS_MAINNET } = process.env

let web3Wallet: any
let web3Guest: any
let web4: any
let userAddress: string
let chainId: number

BigNumber.config({ EXPONENTIAL_AT: 60 })

let pingTimer: any

export const fetchContractData = async (method: string, abi: Array<any>, address: string, params?: Array<any>): Promise<any> => {
  try {
    const contract = new web3Guest.eth.Contract(abi, address)
    return await contract.methods[method].apply(this, params).call()
  } catch (e) {
    console.log(e)
    return ''
  }
}

export const createInst = async (abi: Array<any>, address: string): Promise<any> => {
  const abs = web4.getContractAbstraction(abi)
  return await abs.getInstance(address)
}

export const startPingingMetamask = (callback: any): IResponse => {
  try {
    if (web3Wallet === undefined) {
      return error(500, 'pingingMetamask err')
    }
    const referenceAddress = userAddress
    const referenceChainId = chainId
    clearInterval(pingTimer)
    pingTimer = setInterval(async () => {
      const address = await web3Wallet.eth.getCoinbase()
      const localChainId = await web3Wallet.eth.net.getId()
      if (address !== referenceAddress || localChainId !== referenceChainId) {
        chainId = -1
        userAddress = ''
        callback()
        clearInterval(pingTimer)
      }
    }, 2000)
    return output()
  } catch (err) {
    return error(500, 'pingingMetamask err', err)
  }
}

export const example1 = async (): Promise<IResponse> => {
  const r = await fetchContractData(
    'balanceOf',
    ERC20,
    '0x4b107a23361770534bd1839171bbf4b0eb56485c',
    ['0xBC6ae91F55af580B4C0E8c32D7910d00D3dbe54d']
  )
  console.log('balanceOf', r)
  return output(r)
}

export const connectNode = (): IResponse => {
  try {
    let bscUrl
    if (process.env.IS_MAINNET === 'true') {
      bscUrl = 'wss://mainnet.infura.io/ws/v3/4f9234a0518644ef9b62fb4d4ff53df2'
    } else {
      bscUrl = 'wss://rinkeby.infura.io/ws/v3/4f9234a0518644ef9b62fb4d4ff53df2'
    }
    const provider = new Web3.providers.WebsocketProvider(bscUrl)
    web3Guest = new Web3(provider)
    return output()
  } catch (e) {
    return error(500, 'connection error', e)
  }
}

export const sendTransaction = async (method: string, abi: any[], address: string, params?: string[]): Promise<any> => {
  const inst = new web3Wallet.eth.Contract(abi, address)
  const data = inst.methods[method].apply(null, params).encodeABI()
  const r = await web3Wallet.eth.sendTransaction({
    to: address,
    data,
    from: userAddress
  })
  return r
}

export const connectWallet = async (): Promise<IResponse> => {
  try {
    // @ts-ignore
    const { ethereum } = window
    if (!ethereum) {
      return error(449, 'metamask is not installed')
    }
    web3Wallet = new Web3(ethereum)
    userAddress = await web3Wallet.eth.getCoinbase()
    if (userAddress === null) {
      await ethereum.enable()
      userAddress = await web3Wallet.eth.getCoinbase()
    }
    chainId = await web3Wallet.eth.net.getId()
    if (IS_MAINNET !== 'true' && +chainId !== 4) {
      return error(403, 'invalid chain, change to rinkeby')
    } else if (IS_MAINNET === 'true' && +chainId !== 1) {
      return error(403, 'invalid chain, change to mainnet')
    }
    web4 = new Web4()
    web4.setProvider(ethereum, userAddress)

    // const r = await sendTransaction(
    //   'transfer',
    //   ERC20,
    //   '0x4b107a23361770534bd1839171bbf4b0eb56485c',
    //   [
    //     '0xa364f66f40b8117bbdb772c13ca6a3d36fe95b13', '321'
    //   ]
    // )

    // const inst = new web3Wallet.eth.Contract(ERC20, '0x4b107a23361770534bd1839171bbf4b0eb56485c')
    // const data = inst.methods.approve.apply(null, ['0xa364f66f40b8117bbdb772c13ca6a3d36fe95b13', '100']).encodeABI()
    // const r = await web3Wallet.eth.sendTransaction({
    //   to: '0x4b107a23361770534bd1839171bbf4b0eb56485c',
    //   data,
    //   from: userAddress
    // })
    // console.log(r)

    return output({ userAddress })
  } catch (err) {
    return error(4001, 'connection error', err)
  }
}

export const getFee = async (method: string, abi: Array<any>, address: string, params?: Array<any>): Promise<any> => {
  try {
    const contract = new web3Guest.eth.Contract(abi, address)
    const [
      gasPrice,
      estimateGas
    ] = await Promise.all([
      web3Guest.eth.getGasPrice(),
      contract.methods[method].apply(this, params).estimateGas({ from: userAddress })
    ])
    return gasPrice * estimateGas
  } catch (e) {
    console.log(e)
    return ''
  }
}

export const getWeb3 = (): any => web3Wallet || web3Guest

export const getUserAddress = (): string => userAddress
