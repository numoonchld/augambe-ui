import { ethers, Wallet } from 'ethers'
import { useEffect, useState } from 'react'
import * as HoleyBookCounter from './assets/HoleyBookCounter.json'

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

const checkWalletConnection = async (ethereum) => {

  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      return true
    } else {
      window.alert('Connect site to MetaMask account to use this page!')
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

/*
const getWalletBalance = async () => {
  try {
    const metamaskWalletProvider = new ethers.providers.Web3Provider(ethereum)
    return bigNumberToETHString(
      await metamaskWalletProvider.getSigner().getBalance(),
    )
  } catch (err) {
    console.log(err)
  }
}
*/

function App() {
  const [countCyclic, setCountCyclic] = useState(0)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [txnCosts, setTxnCosts] = useState([])
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const goerliProvider = ethers.getDefaultProvider('goerli')
  let targetContract
  let signer

  const updatedAppCounterState = async (targetContract) => {
    const latestCountCyclic = await targetContract.countCyclic()
    setCountCyclic(latestCountCyclic)
  }

  const updatedAppCyclesCounterState = async (targetContract) => {
    const latestCountCyclesCompletedCyclic = await targetContract.cyclesCompleted()
    setCyclesCompleted(latestCountCyclesCompletedCyclic)
  }

  const contractConnect = async () => {
    // contract
    const { abi } = HoleyBookCounter
    targetContract = new ethers.Contract(CONTRACT_ADDRESS, abi, goerliProvider)

    if (await checkWalletConnection(ethereum)) {
      //  interface with browser
      await connectToWallet(ethereum)

      // get metamask signer from browser
      signer = await getMetamaskWalletSigner()

      updatedAppCounterState(signer, targetContract)
      updatedAppCyclesCounterState(signer, targetContract)
    }
  }

  useEffect(() => {
    contractConnect()
  }, [])

  const handleClick = async () => {
    console.log('button clicked!')

    const incrementCounterTxn = await targetContract.connect(signer).incrementCounter()
    const incrementCounterTxnReceipt = await incrementCounterTxn.wait()

    const txnGasCostBN = incrementCounterTxnReceipt.gasUsed
    const txnGasCost = Number(ethers.utils.formatEther(txnGasCostBN))
    console.log(countCyclic, txnGasCost)
    console.log(txnCosts)

    setTxnCosts([{ countCyclic, txnGasCost }, ...txnCosts])

    if (incrementCounterTxnReceipt.confirmations > 0) await updatedAppCounterState()


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
    <div style={appWrapper}>
      <div style={landscape() ? appContainerLandscape : appContainerPortrait} >
        <button style={connectWalletButtonStyle} onClick={async () => connectToWallet(ethereum)}>
          <span className='text-white fs-6 py-1' >Connect to wallet</span>
        </button>
        <div>
          <input disabled={true} style={inputStyle} value={countCyclic} />
          <input disabled={true} style={inputStyle} value={cyclesCompleted} />
        </div>
        <button style={buttonStyle} onClick={handleClick}>
          <span className='text-white fs-2 py-1' ><b>&#9735;</b></span>
        </button>
      </div>
      <div className='fs-5 text-left mt-5'>
        {
          txnCosts.map((txn) => <GasCostEntry countCyclic={txn.countCyclic} txnGasCost={txn.txnGasCost} />)
        }
      </div>

    </div>
  );
}

export default App;
