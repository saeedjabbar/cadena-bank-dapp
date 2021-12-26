import { useState, useEffect, useCallback } from 'react';
import { ethers, BigNumber, utils } from "ethers";
import abi from "./contracts/Bank.json";
//emitters

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [bankOwnerAddress, setBankOwnerAddress] = useState("");
  const [customerTotalBalance, setCustomerTotalBalance] = useState("");
  const [bankName, setCurrentBankName] = useState("");


  const CONTRACT_ADDRESS = '0x2d00Aa8e42c4aCf7B0657cc1753bF6f61e43D84b';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getbankOwnerHandler = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);
        console.log("Retrieved owner account...", owner);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }, [contractABI])



  const customerBalanceHanlder = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        let balance = await bankContract.getBankBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }, [contractABI])


  const deposityMoneyHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        const txn = await bankContract.depositMoney({ value: ethers.utils.parseEther("0.37") });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        customerBalanceHanlder();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withDrawMoneyHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await bankContract.withDrawMoney(myAddress, ethers.utils.parseEther("0.37"));
        console.log("With drawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        customerBalanceHanlder();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getBankName = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName.toString());
        console.log("Retrieved Bank Name...", bankName);
        console.log("Retrieved TypeOF...", typeof bankName);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }, [contractABI])


  const setBankNameHandler = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        const txn = await bankContract.setBankName(utils.formatBytes32String("Bank of JavaScript"));
        console.log("Setting Bank Name...");
        await txn.wait();
        console.log("Bank name...done", txn.hash);
        getBankName();
        console.log("Current Bank Name...", txn);

      } else {

      }
    } catch (error) {
      console.log(error)
    }
  }, [contractABI, getBankName])


  useEffect(() => {
    checkIfWalletIsConnected();
    getbankOwnerHandler()
    customerBalanceHanlder()
    getBankName()
    //setBankNameHandler()
  }, [getbankOwnerHandler, customerBalanceHanlder, getBankName, setBankNameHandler])


  /*
    TODO:
    [x] setbank name, if owner
    [x] getbank name, anyone
    [x] withdraw money, if account owner
    [] emitters
    [] build in input fields and forms, wire it up
    [] refactor
  */


  return (
    <div className=''>
      <h1 className="text-xl border-b-2">Bank Contract Project</h1>
      {!currentAccount && (
        <button className="border bg-indigo-300 p-3" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      <div className='mt-5'>
        <p>Bank Name: {bankName === "" ? "Setup the name of your bank." : bankName}</p>
        <button className="border bg-indigo-300 p-3" onClick={getBankName}>
          Bank Name
        </button>
      </div>
      <div className="my-5">
        <span>Enter Your Bank Name: <input className="border border-black" type="text" /></span>
        <button className="border bg-indigo-300 p-3" onClick={getBankName}>
          Set Bank Name
        </button>
      </div>
      <button className="border bg-indigo-300 p-3" onClick={deposityMoneyHandler}>
        Deposite Money
      </button>
      <div className="mt-5">
        <p>Withdraw Money</p>
        <button className="border bg-indigo-300 p-3" onClick={withDrawMoneyHandler}>Withdraw Money</button>
      </div>
      <div className="mt-5">
        <p>Bank Owner Address: {bankOwnerAddress}</p>
        <button className='border bg-indigo-300 p-3' onClick={getbankOwnerHandler}>Bank Owner</button>
      </div>
      <div className="mt-5">
        <p>Customer Balance: {customerTotalBalance}</p>
        <button className="border bg-indigo-300 p-3" onClick={customerBalanceHanlder}>Get Customer Balance</button>
      </div>
    </div>
  );
}

export default App;