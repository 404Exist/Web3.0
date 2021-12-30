import React, { createContext, useEffect, useState } from "react";
import { ethers } from 'ethers';
import { contractABI, contractAddress} from '../utils/constants.js';

export const TransactionContext = createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
  return transactionContract;
}

export const TransactionProvider = ({ children }) => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount') || 0);
  const [transactions, setTransactions] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');

  const handleChange = (e, name) => {
    setFormData(prevState => ({ ...prevState, [name]: e.target.value }));
  }
  const getAllTrnsactions = async () => {
    try {
      if (!ethereum) return;
      const transactionsContract = getEthereumContract();
      const availableTransactions = await transactionsContract.getAllTransactions();
      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }));
      setTransactions(structuredTransactions);
    } catch(error) {
      console.log(error);
      throw new Error('No ethereum object.');
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return;
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length) {
        setConnectedAccount(accounts[0]);
        getAllTrnsactions();
      } 
    } catch(error) {
      console.log(error);
      throw new Error('No ethereum object.');
    }
  }

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();
      window.localStorage.setItem('transactionCount', transactionCount);

    } catch(error) {
      console.log(error);
      throw new Error('No ethereum object.');
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) return setAlertMsg('Please install metamask');
      if (!window.navigator.onLine) return setAlertMsg('Please check your internet connection then try again.');
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      setConnectedAccount(accounts[0]);
    } catch(error) {
      console.log(error);
      throw new Error('No ethereum object.');
    }
  }

  const sendTransaction = async () => {
    try {
      if (!ethereum) return setAlertMsg("Please install metamask");
      if (!window.navigator.onLine) return setAlertMsg('Please check your internet connection then try again.');
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount); 
      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: connectedAccount,
          to: addressTo,
          gas: '0x5208',
          value: parsedAmount._hex,
        }]
      });

      const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
      setIsLoading(true);
      await transactionHash.wait();
      setIsLoading(false);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
      window.reload();
    } catch (error) {
      setAlertMsg(error.code == '-32602' ? 'Please connect your wallet first.' : error.message);
      console.log(error);
      throw new Error('No ethereum object.');
    }
  }
  useEffect(() => {
    if (!window.navigator.onLine) return;
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, [])
  return (
    <TransactionContext.Provider value={{ connectWallet, connectedAccount, formData, sendTransaction, handleChange, isLoading, transactions, alertMsg, setAlertMsg }}>
      {children}
    </TransactionContext.Provider>
  )
}