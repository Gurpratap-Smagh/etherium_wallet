import { useState, useEffect} from 'react'
import {BrowserRouter, Routes, Route, Link, Outlet, Navigate} from 'react-router-dom'
import { RecoilRoot, useRecoilValue, useSetRecoilState, useRecoilCallback } from 'recoil'
import { containersFamily, seed_phrase, d_id, clearKeysAtom} from './atoms.jsx'
import './App.css'
import { Mnemonic, ethers, Wallet } from 'ethers' // took me ages to realise, we must do alot of work to use bip32 and others

function App() {

  return (
    <RecoilRoot>
      <BrowserRouter>
        <div className="wallet-container">
          <Routes>
            <Route path="*" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home_page />}>
              <Route path="/home/eth_wallet" element={<Ethos />} />
              <Route path="/home/balance" element={<See_balance />} />
              <Route path="/home/priv_to_pub" element={<Priv_to_pub />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </RecoilRoot>
  );
}
function Home_page() {
  return (
    <>
      <div className="wallet-header">
        <h1 className="wallet-title">BROMSKIII WALLET</h1>
        <p className="wallet-subtitle">Elite Crypto Operations</p>
      </div>
      
      <nav className="nav-container">
        <Link to="/home/eth_wallet" className="nav-link">
          🔐 Ethereum Wallet
        </Link>
        <Link to="/home/balance" className="nav-link">
          💰 Balance Check
        </Link>
        <Link to="/home/priv_to_pub" className="nav-link">
          🔑 Key Converter
        </Link>
      </nav>
      
      <Outlet />
    </>
  )
}
function Ethos() {
  return (
    <div className="content-card">
      <h2 className="form-label">🔐 Ethereum Wallet Generator</h2>
      <div className="form-group">
        <label className="form-label">Seed Phrase</label>
        <Input_seed />
      </div>
      <div className="form-group">
        <Generate_nem />
        <Handle_change />
      </div>
      <Show_the_stuff />
    </div>
  );
}
function Input_seed() {
  const seed_value = useRecoilValue(seed_phrase);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(seed_value.phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`wallet-readonly-container ${copied ? 'copied' : ''}`}>
    <div
    className={`wallet-readonly copyshi ${copied ? 'copied' : ''}`}
    onClick={handleCopy}
    style={{ flex: 1, marginRight: '0.5rem', cursor: 'pointer' }}
    title="Click to copy"
  >
    {seed_value.phrase}
  </div>
</div>
  )
}
// function Handle_change() {
//   const seed_p = useRecoilValue(seed_phrase)
//   const make_prkey = useSetRecoilState(private_key)
//   const make_pukey = useSetRecoilState(public_key)
//   const get_pukey = useRecoilValue(public_key)
//   const get_prkey = useRecoilValue(private_key)
//   const make_ar = useSetRecoilState(containers)
//   const master_g = function() {
//     make_prkey(seed_p)
//     make_pukey(seed_p)
//     const new_box= {id: crypto.randomUUID(), private_key: {get_prkey}, public_key: {get_pukey}}
//     make_ar((prevItems) => [...prevItems, new_box]);
//   }
//   return <>
//     <button onClick={master_g}>get_prkey</button>
//   </>
// }  This was a noob attempt
function Handle_change() {
  const increase = useSetRecoilState(d_id);
  const keyPair = () => {  
  increase((prev) => prev + 1);
  }
  

  

  return <button className="wallet-button" onClick={keyPair}>⚡ Generate Keys</button>;
}
function Show_the_stuff() {
  const ids = useRecoilValue(d_id);
  
  const [get_ar, setGetAr] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});
  const fetchData = useRecoilCallback(({ snapshot }) => async (currentIds) => {
    const containersList = [];
    for (let j = 0; j < currentIds; j++) {
      const container = await snapshot.getPromise(containersFamily(j));
      containersList.push({
        id: j,
        private_key: container.privateKey,
        public_key: container.address
      });
    }
    setGetAr(containersList);
  }, []);
  useEffect(() => {
    fetchData(ids);
  }, [ids, fetchData]);

  const handleCopyClick = (e, id) => {
    const text = e.target.innerText;
    navigator.clipboard.writeText(text);

    setCopiedStates((prevState) => ({ ...prevState, [id]: true }));

    setTimeout(() => {
      setCopiedStates((prevState) => {
        const newState = { ...prevState };
        delete newState[id];
        return newState;
      });
    }, 1500);
  };

  return (
    <div>
      {get_ar.map((i) => (
        <div
          key={i.id}
          className="key-display-wrapper"
          style={{ marginBottom: '1rem' }}
        >
          <div className="key-display private-key">
            <strong>🔒 Private Key:</strong>
            <br />
            <div
              className={`copyshi ${copiedStates[i.id] ? 'copied' : ''}`}
              onClick={(e) => handleCopyClick(e, i.id)}
            >
              {i.private_key}
            </div>
          </div>
          <div className="key-display public-key">
            <strong>🔑 Public Key:</strong>
            <br />
            <div
              className={`copyshi ${copiedStates[i.id] ? 'copied' : ''}`}
              onClick={(e) => handleCopyClick(e, i.id)}
            >
              {i.public_key}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Generate_nem() {
  const changing_seed = useSetRecoilState(seed_phrase)
  const clearKeys = useRecoilCallback(({ set }) => () => {
    set(clearKeysAtom, true);
    setTimeout(() => {
      set(clearKeysAtom, false);
      set(d_id, 0);
    }, 500);
  });

  function generator() {
    const mnemonic = Mnemonic.fromEntropy(ethers.randomBytes(16));
    changing_seed(mnemonic);
    clearKeys()
    console.log("Generated seed phrase:", mnemonic.phrase);
  }
  return (
    <button className="wallet-button" onClick={generator}>
      🎲 Generate Seed
    </button>
  )
}

function See_balance() {
  const [balance, setBalance] = useState(null);
  const [address, setAddress] = useState("");
  const [usd, setusd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedBalance, setCopiedBalance] = useState(false);
  const [copiedUsd, setCopiedUsd] = useState(false);
  const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`)
  const fetchEthPrice = async () => {
  	const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
 	const data = await res.json();
 	return data.ethereum.usd;
};

  const fetchBalance = async () => {
    if (!address.trim()) return;
    setLoading(true);
    try {
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
      const pric = await fetchEthPrice();
      const parsed = parseFloat(ethers.formatEther(bal));
      setusd((pric * parseFloat(parsed)).toFixed(2))
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error fetching balance");
      setusd("unable to fetch the price")
    } finally {
      setLoading(false);
    }
  }
  
  const handleCopyBalance = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1500);
  };

  return (
    <div className="content-card">
      <h2 className="form-label">💰 Balance Checker</h2>
      <div className="form-group">
        <label className="form-label">Ethereum Address</label>
        <input 
          className="wallet-input"
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder='0x1234...abcd'
        />
      </div>
      <button className="wallet-button" onClick={fetchBalance} disabled={loading}>
        {loading ? (
          <>
            🔍 Checking
            <span className="loading"></span>
          </>
        ) : (
          '🔍 Get Balance'
        )}
      </button>
      {balance !== null && (<>
        	<div className="balance-display">
          	💎 Balance: <span className={`copyshi ${copiedBalance ? 'copied' : ''}`} onClick={() => handleCopyBalance(balance, setCopiedBalance)}>{balance}</span> ETH
        	</div>
		<div className="balance-display">
	  	💎 Balance: $<span className={`copyshi ${copiedUsd ? 'copied' : ''}`} onClick={() => handleCopyBalance(usd, setCopiedUsd)}>{usd}</span> USD
		</div>
	</>
      )}
    </div>
  )
}

function Priv_to_pub() {
  const [inputd, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  const convertKey = async () => {
    if (!inputd.trim()) return;
    setLoading(true);
    try {
      const wallet = new Wallet(inputd.trim());
      console.log("Public key:", wallet.address);
      setResult(wallet.address);
    } catch (error) {
      console.error("Error converting key:", error);
      setResult("Invalid private key");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 1500);
  };

  return (
    <div className="content-card">
      <h2 className="form-label">🔑 Key Converter</h2>
      <div className="form-group">
        <label className="form-label">Private Key</label>
        <input 
          className="wallet-input"
          value={inputd} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Enter private key..."
          type="password"
        />
      </div>
      <button className="wallet-button" onClick={convertKey} disabled={loading}>
        {loading ? (
          <>
            🔄 Converting
            <span className="loading"></span>
          </>
        ) : (
          '🔄 Get public address'
        )}
      </button>
      {result && (
        <div className="output-container">
          <strong>🔑 Public Address:</strong><br />
          <div className={`copyshi ${copiedResult ? 'copied' : ''}`} onClick={handleCopyResult}>
            {result}
          </div>
        </div>
      )}
    </div>
  )
}


export default App

