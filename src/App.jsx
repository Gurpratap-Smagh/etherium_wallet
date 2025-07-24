import { useState, } from 'react'
import {BrowserRouter, Routes, Route, Link, Outlet, Navigate} from 'react-router-dom'
import { RecoilRoot, useRecoilValue, useSetRecoilState, useRecoilCallback } from 'recoil'
import {containers, public_key, private_key, seed_phrase, d_id} from './atoms.jsx'
import './App.css'
import { Mnemonic, ethers, Wallet } from 'ethers'

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
  )
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
  )
}
function Input_seed() {
  const [input_value, input_box] = useState("")
  const changing_seed = useSetRecoilState(seed_phrase)
  const seed_value = useRecoilValue(seed_phrase)
  const change_seed = function(e) {
    const new_value = e.target.value;
    input_box(new_value);   
    changing_seed(new_value)
    console.log("changed")
  }
  return (
    <input 
      className="wallet-input" 
      onChange={change_seed} 
      value={seed_value.phrase} 
      placeholder="Enter your seed phrase..."
    />
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
// }
function Handle_change() {
  const indexd = useRecoilValue(d_id);
  const updateState = useRecoilCallback(({ snapshot, set }) => async () => {

    const new_prkey = await snapshot.getPromise(private_key);
    const new_pukey = await snapshot.getPromise(public_key);

    const new_box = {
      id: crypto.randomUUID(),
      private_key: new_prkey,
      public_key: new_pukey,
    };

    set(containers, (prev) => [...prev, new_box]);
    set(d_id, indexd + 1); // Increment the index for the next key pair
    console.log("New key pair added to containers.");
  });

  return <button className="wallet-button" onClick={updateState}>⚡ Generate Keys</button>;
}
function Show_the_stuff() {
  const get_ar = useRecoilValue(containers)
  return (
    <div>
      {get_ar.map((i) => (
        <div key={i.id} style={{ marginBottom: '1rem' }}>
          <div className="key-display private-key">
            <strong>🔒 Private Key:</strong><br />
            {i.private_key}
          </div>
          <div className="key-display public-key">
            <strong>🔑 Public Key:</strong><br />
            {i.public_key}
          </div>
        </div>
      ))}
    </div>
  )
}
function Generate_nem() {
  const changing_seed = useSetRecoilState(seed_phrase)

  function generator() {
    const mnemonic = Mnemonic.fromEntropy(ethers.randomBytes(16));
    changing_seed(mnemonic);
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
  const [loading, setLoading] = useState(false);
  const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`)

  const fetchBalance = async () => {
    if (!address.trim()) return;
    setLoading(true);
    try {
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error fetching balance");
    } finally {
      setLoading(false);
    }
  }
  
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
      {balance !== null && (
        <div className="balance-display">
          💎 Balance: {balance} ETH
        </div>
      )}
    </div>
  )
}

function Priv_to_pub() {
  const [inputd, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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
          '🔄 Convert to Public'
        )}
      </button>
      {result && (
        <div className="output-container">
          <strong>🔑 Public Address:</strong><br />
          {result}
        </div>
      )}
    </div>
  )
}
export default App
