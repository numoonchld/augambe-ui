import { ethers, BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
// import * as HoleyBookCounter from './assets/HoleyBookCounter.json'


const HoleyBookCounter = {
  "_format": "hh-sol-artifact-1",
  "contractName": "HoleyBookCounter",
  "sourceName": "contracts/holey-book-counter.sol",
  "abi": [
    {
      "inputs": [],
      "name": "countCyclic",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cyclesCompleted",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "incrementCounter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "bytecode": "0x60806040526010600060016101000a81548160ff021916908360ff16021790555034801561002c57600080fd5b506101f58061003c6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80634b5929c2146100465780635b34b966146100645780638e5c0f7e1461006e575b600080fd5b61004e61008c565b60405161005b919061013e565b60405180910390f35b61006c610092565b005b610076610114565b6040516100839190610175565b60405180910390f35b60015481565b60008081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff1602179055505060008060019054906101000a900460ff1660ff1660008054906101000a900460ff1660ff16816100f6576100f5610190565b5b0660ff1603610112576001600081548092919060010191905055505b565b60008054906101000a900460ff1681565b6000819050919050565b61013881610125565b82525050565b6000602082019050610153600083018461012f565b92915050565b600060ff82169050919050565b61016f81610159565b82525050565b600060208201905061018a6000830184610166565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fdfea26469706673582212206771ebe24a5e509ce8f144a5e8f2c05fcb513e76050edfe2bbca928514fe334a64736f6c63430008110033",
  "deployedBytecode": "0x608060405234801561001057600080fd5b50600436106100415760003560e01c80634b5929c2146100465780635b34b966146100645780638e5c0f7e1461006e575b600080fd5b61004e61008c565b60405161005b919061013e565b60405180910390f35b61006c610092565b005b610076610114565b6040516100839190610175565b60405180910390f35b60015481565b60008081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff1602179055505060008060019054906101000a900460ff1660ff1660008054906101000a900460ff1660ff16816100f6576100f5610190565b5b0660ff1603610112576001600081548092919060010191905055505b565b60008054906101000a900460ff1681565b6000819050919050565b61013881610125565b82525050565b6000602082019050610153600083018461012f565b92915050565b600060ff82169050919050565b61016f81610159565b82525050565b600060208201905061018a6000830184610166565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fdfea26469706673582212206771ebe24a5e509ce8f144a5e8f2c05fcb513e76050edfe2bbca928514fe334a64736f6c63430008110033",
  "linkReferences": {},
  "deployedLinkReferences": {}
}

const { ethereum } = window

// const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const CONTRACT_ADDRESS = "0xCd9B486daA509a8d3496f0DfD2285cEdE8F3Af64"

const counterSeed = () => {
  let count = 0
  return () => count++
}

const counter = counterSeed()

const GasCostEntry = ({ countCyclic, txnGasCost }) => {
  return <div key={counter()}>
    <span>&#128293;&nbsp; <b>{countCyclic}/</b> Last Gas Cost: {txnGasCost}</span>
    <hr />
  </div>
}

const Spinner = () => <div className="spinner-border text-light" role="status">
  <span className="visually-hidden">Loading...</span>
</div>



function App() {
  const [countCyclic, setCountCyclic] = useState(0)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [txnCosts, setTxnCosts] = useState([])
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isTransacting, setIsTransaction] = useState(false)

  const goerliProvider = ethers.getDefaultProvider('goerli')
  const { abi } = HoleyBookCounter
  const targetContract = new ethers.Contract(CONTRACT_ADDRESS, abi, goerliProvider)
  let signer

  const bigNumberToETHString = (eth) =>
    ethers.utils.formatEther(eth.toString())

  const checkWalletConnection = async (ethereum) => {

    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        setIsWalletConnected(true)
        return true
      } else {
        window.alert('Connect site to MetaMask account to use this page!')
        setIsWalletConnected(false)
        return false
      }

    } catch (err) {
      console.log(err)
    }

  }

  const connectToWallet = async (ethereum) => {
    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      setIsWalletConnected(true)
      return accounts[0]

    } catch (err) {
      console.log(err)
    }

  }

  const getMetamaskWalletSigner = async () => {
    try {
      const metamaskWalletProvider = new ethers.providers.Web3Provider(ethereum)
      return metamaskWalletProvider.getSigner()
    } catch (err) {
      console.log(err)
    }

  }


  const getWalletBalance = async () => {
    try {
      const metamaskWalletProvider = new ethers.providers.Web3Provider(ethereum)
      // return [await metamaskWalletProvider.getSigner().getBalance(), bigNumberToETHString(await metamaskWalletProvider.getSigner().getBalance())]
      // return bigNumberToETHString(await metamaskWalletProvider.getSigner().getBalance())
      return await metamaskWalletProvider.getSigner().getBalance()
    } catch (err) {
      console.log(err)
    }
  }

  const updatedAppCounterState = async (targetContract) => {
    // const latestCountCyclic = (await targetContract['countCyclic'])()
    // const latestCountCyclic = await targetContract['countCyclic']
    // const latestCountCyclic = await targetContract.countCyclic()
    const latestCountCyclic = await targetContract.countCyclic()
    console.log({ latestCountCyclic })
    setCountCyclic(latestCountCyclic)
  }

  const updatedAppCyclesCounterState = async (targetContract) => {
    // const latestCountCyclesCompletedCyclic = (await targetContract['cyclesCompleted'])()
    // const latestCountCyclesCompletedCyclic = await targetContract['cyclesCompleted']
    // const latestCountCyclesCompletedCyclic = await targetContract.cyclesCompleted()
    const latestCountCyclesCompletedCyclic = await targetContract.cyclesCompleted()
    console.log({ latestCountCyclesCompletedCyclic }, bigNumberToETHString(latestCountCyclesCompletedCyclic))
    setCyclesCompleted(latestCountCyclesCompletedCyclic)
  }

  const contractConnect = async () => {
    // contract

    if (await checkWalletConnection(ethereum)) {
      //  interface with browser
      await connectToWallet(ethereum)

      // get metamask signer from browser
      signer = await getMetamaskWalletSigner()

      updatedAppCounterState(targetContract)
      updatedAppCyclesCounterState(targetContract)
    }

  }

  useEffect(() => {
    contractConnect()
  }, [])

  const handleClick = async () => {
    console.log('button clicked!')
    setIsTransaction(true)

    try {
      const signer = await getMetamaskWalletSigner()
      console.log('signer: ', signer)
      console.log('contract: ', await targetContract)

      const walletBalance = Number(ethers.utils.formatEther(await getWalletBalance()));
      console.log({ walletBalance })

      if (walletBalance > 0.001) {
        const incrementCounterTxn = await targetContract.connect(signer).incrementCounter()
        const incrementCounterTxnReceipt = await incrementCounterTxn.wait()

        const txnGasCostBN = incrementCounterTxnReceipt.gasUsed
        const txnGasCost = Number(ethers.utils.formatEther(txnGasCostBN))
        console.log(countCyclic, txnGasCost)

        setTxnCosts([{ countCyclic, txnGasCost }, ...txnCosts])
        console.log(txnCosts, incrementCounterTxnReceipt.confirmations)

        if (incrementCounterTxnReceipt.confirmations > 0) await updatedAppCounterState(targetContract) && await updatedAppCyclesCounterState(targetContract)
        else window.alert('Failed to read updated state changes in contract!')
      }


    } catch (err) {
      console.log(err)
      window.alert(err)
    } finally {
      setIsTransaction(false)
    }




    // const contractConnectClosure = await contractConnect()
    // const signer = contractConnectClosure()

    /*
    // TODO: throttling
    setTimeout(async () => {

      const incrementCounterTxn = await targetContract.connect(signer).incrementCounter()
      const incrementCounterTxnReceipt = await incrementCounterTxn.wait()

      const txnGasCostBN = incrementCounterTxnReceipt.gasUsed
      const txnGasCost = Number(ethers.utils.formatEther(txnGasCostBN))
      console.log(countCyclic, txnGasCost)
      console.log(txnCosts)

      setTxnCosts([{ countCyclic, txnGasCost }, ...txnCosts])

      if (incrementCounterTxnReceipt.confirmations > 0) await updatedAppCounterState()

    }, 1500)
    */


  }

  // const portrait = () => window.matchMedia("(max-width: 375px)").matches
  const landscape = () => window.matchMedia("(min-width: 376px)").matches

  const appWrapper = {
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
    height: '98vh',
    padding: "120px 120px"
  }

  const inputStyle = {
    width: '100%',
    marginBottom: '16px'
  }

  const buttonStyle = {
    backgroundColor: 'green',
    height: '50px',
    width: '100%',
    border: 'none',
    borderRadius: '5px'
  }

  const connectWalletButtonStyle = {
    backgroundColor: 'red',
    height: '40px',
    width: '50%',
    border: 'none',
    borderRadius: '25px',
    margin: '16px auto'

  }

  const appContainerLandscape = {
    display: "flex",
    flexDirection: "column",
    columnGap: "21px",
  }

  const appContainerPortrait = {
    display: "flex",
    flexDirection: "column",
    gap: "21px"
  }

  return (
    <>
      {!ethereum && <div>MetaMask needed to use this web dApp!</div>}
      {ethereum && < div style={appWrapper} >
        <div style={landscape() ? appContainerLandscape : appContainerPortrait} >
          {!isWalletConnected && <button style={connectWalletButtonStyle} onClick={async () => connectToWallet(ethereum)}>
            <span className='text-white fs-6 py-1' >Connect to wallet</span>
          </button>}
          <div>
            <input disabled={true} style={inputStyle} value={countCyclic} />
            <input disabled={true} style={inputStyle} value={cyclesCompleted} />
          </div>
          <button style={buttonStyle} onClick={handleClick}>
            <span className='text-white fs-2 d-flex justify-content-center align-items-center' >{isTransacting ? <Spinner /> : <b>&#9735;</b>}</span>
          </button>
        </div>
        <div className='fs-5 text-left mt-5'>
          {
            txnCosts.map((txn) => <GasCostEntry key={txn.countCyclic} countCyclic={txn.countCyclic} txnGasCost={txn.txnGasCost} />)
          }
        </div>

      </div >}</>
  );
}

export default App;
