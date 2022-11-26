import { ethers, Wallet } from 'ethers'
import { useEffect, useState } from 'react'
import * as LotteryTokenContractJSON from '../src/assets/HoleyBookCounter.json'

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

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

function App() {
  const [countCyclic, setCountCyclic] = useState(0)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [txnCosts, setTxnCosts] = useState([])
  // const [prevTxnID, setPrevTxnID] = useState(null)
  // const [prevTxnCost, setPrevTxnCost] = useState(null)





  // const divClosure = () => {

  //   let memory = []

  //   return (prevTxnID, prevTxnCost) => {
  //     memory = [...memory, { prevTxnID, prevTxnCost }]

  //     return memory
  //   }
  // }

  // let gasTracker = divClosure()

  // provider
  const localHardhatProvider = ethers.getDefaultProvider('http://localhost:8545')

  // contract
  const { abi } = LotteryTokenContractJSON
  const targetContract = new ethers.Contract(CONTRACT_ADDRESS, abi, localHardhatProvider)
  targetContract.connect(localHardhatProvider)

  const updatedAppCounterState = async () => {
    const latestCountCyclic = await targetContract.countCyclic()
    setCountCyclic(latestCountCyclic)
  }

  const updatedAppCyclesCounterState = async () => {
    const latestCountCyclesCompletedCyclic = await targetContract.cyclesCompleted()
    setCyclesCompleted(latestCountCyclesCompletedCyclic)
  }
  // const updateTxnCosts = async (countCyclic, txnGasCost) => {
  //   console.log(countCyclic, txnGasCost)
  //   setTxnCosts(...txnCosts, [countCyclic, txnGasCost])
  // }

  const contractConnect = async () => {
    // create a wallet instance from a mnemonic...
    // const mnemonic = "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
    // const walletMnemonic = Wallet.fromMnemonic(mnemonic)

    // the connect method returns a new instance of the
    // wallet connected to a provider
    // const wallet = walletMnemonic.connect(localHardhatProvider)

    const wallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
    const signer = wallet.connect(localHardhatProvider)

    updatedAppCounterState()
    updatedAppCyclesCounterState()



    return signer
  }

  useEffect(() => {
    contractConnect()

    // targetContract.

    // return () => {
    //   second
    // }
  }, [])

  // useEffect(() => {
  //   gasTracker()
  // }, [prevTxnCost])

  const handleClick = async () => {
    console.log('button clicked!')

    const signer = await contractConnect()

    const incrementCounterTxn = await targetContract.connect(signer).incrementCounter()
    const incrementCounterTxnReceipt = await incrementCounterTxn.wait()

    const txnGasCostBN = incrementCounterTxnReceipt.gasUsed
    const txnGasCost = Number(ethers.utils.formatEther(txnGasCostBN))
    console.log(countCyclic, txnGasCost)
    console.log(txnCosts)

    setTxnCosts([{ countCyclic, txnGasCost }, ...txnCosts])

    if (incrementCounterTxnReceipt.confirmations > 0) await updatedAppCounterState()
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
