import { useEffect, useState } from 'react';
import './App.css';
import Landing from './Components/Landing';
import abi from './Contract/CrowdfundingCampaign.json'
import { ethers } from 'ethers';
function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
    account: null,
  });
  const connectWallet = async () => {
    const contractAddress = "0x21A143EEA29bCB8D503083607b0bf44D4cc6A031";
    const contractABI = abi.abi;
    try {
      const { ethereum } = window;
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          const provider = new ethers.providers.Web3Provider(window.ethereum); // Using Web3Provider // first make a react app-> npm install --save ether@5.7.2 then do as you like
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          setState({ provider, signer, contract, account: accounts[0] });
        } else {
          setState(prevState => ({ ...prevState, account: null }));
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    connectWallet();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setState(prevState => ({ ...prevState, account: accounts[0] }));
      } else {
        setState(prevState => ({ ...prevState, account: null }));
        console.log("Please connect to MetaMask.");
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    const checkAccounts = async () => {
      const { ethereum } = window;
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          setState(prevState => ({ ...prevState, account: null }));
        }
      }
    };

    const interval = setInterval(checkAccounts, 1000);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      clearInterval(interval);
    };
  }, []);
  return (
    <div>
      <Landing state={state} />
    </div>
  );
}

export default App;