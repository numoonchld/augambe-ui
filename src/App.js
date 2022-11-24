import { ethers, Wallet } from 'ethers'
import { useEffect, useState } from 'react'
import * as LotteryTokenContractJSON from '../src/assets/HoleyBookCounter.json'

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

function App() {
  console.log('-------------------------')

  const [countCyclic, setCountCyclic] = useState(0)

  // provider
  const localHardhatProvider = ethers.getDefaultProvider('http://localhost:8545')

  // contract
  const { abi } = LotteryTokenContractJSON
  const targetContract = new ethers.Contract(CONTRACT_ADDRESS, abi, localHardhatProvider)
  targetContract.connect(localHardhatProvider)

  const updatedAppCounterState = async () => {
    const countCyclicOnLoad = await targetContract.countCyclic()
    setCountCyclic(countCyclicOnLoad)
  }

  const contractConnect = async () => {

    // create a wallet instance from a mnemonic...
    // const mnemonic = "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
    // const walletMnemonic = Wallet.fromMnemonic(mnemonic)

    // the connect method returns a new instance of the
    // wallet connected to a provider
    // const wallet = walletMnemonic.connect(localHardhatProvider)

    const wallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")

    const signer = wallet.connect(localHardhatProvider)
    const balanceBN = await signer.getBalance()
    console.log(balanceBN)

    updatedAppCounterState()

    return signer

  }

  useEffect(() => {
    contractConnect()
    // targetContract.

    // return () => {
    //   second
    // }
  }, [])

  const handleClick = async () => {
    console.log('button clicked!')

    const signer = await contractConnect()

    const incrementCounterTxn = await targetContract.connect(signer).incrementCounter()
    const incrementCounterTxnReceipt = await incrementCounterTxn.wait()

    const txnGasCostBN = incrementCounterTxnReceipt.gasUsed
    const txnGasCost = Number(ethers.utils.formatEther(txnGasCostBN))
    console.log(countCyclic, txnGasCost)

    if (incrementCounterTxnReceipt.confirmations > 0) await updatedAppCounterState()

  }

  // const portrait = () => window.matchMedia("(max-width: 375px)").matches
  const landscape = () => window.matchMedia("(min-width: 376px)").matches
  console.log('isLandscape?: ', landscape())

  const appWrapper = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '98vh'
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
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "21px",
    padding: "0 120px"
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
          <button style={buttonStyle} onClick={handleClick}></button>
        </div>
        <div>
          Hello World
        </div>
      </div>
    </div>
  );
}

export default App;
