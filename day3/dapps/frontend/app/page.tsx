'use client';

import { useState, useEffect } from 'react';

// ==============================
// 🔹 CONFIG
// ==============================
const CONTRACT_ADDRESS = '0x1b1928Db1CB9F9Ffede4B88B53c8FEC86B44B900'; // 👈 GANTI INI
const FUJI_CHAIN_ID = '0xa869'; // 43113 in hex
const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';

const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ==============================
// 🔹 HELPER FUNCTIONS
// ==============================
function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Page() {
  // ==============================
  // 🔹 STATE
  // ==============================
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [value, setValue] = useState('');
  const [owner, setOwner] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const isCorrectNetwork = chainId === FUJI_CHAIN_ID;
  const isConnected = account !== '';

  // ==============================
  // 🔹 TOAST NOTIFICATION
  // ==============================
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
  };

  // ==============================
  // 🔹 CONNECT WALLET
  // ==============================
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showToast('Please install Core Wallet or MetaMask', 'error');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
      
      const chain = await window.ethereum.request({
        method: 'eth_chainId',
      });
      setChainId(chain);
      
      showToast('Wallet connected!', 'success');
    } catch (error: any) {
      showToast('Failed to connect wallet: ' + error.message, 'error');
    }
  };

  // ==============================
  // 🔹 DISCONNECT WALLET
  // ==============================
  const disconnectWallet = () => {
    setAccount('');
    setChainId('');
    setValue('');
    setOwner('');
    showToast('Wallet disconnected', 'info');
  };

  // ==============================
  // 🔹 SWITCH TO FUJI
  // ==============================
  const switchToFuji = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: FUJI_CHAIN_ID }],
      });
      setChainId(FUJI_CHAIN_ID);
      showToast('Switched to Avalanche Fuji', 'success');
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: FUJI_CHAIN_ID,
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
              rpcUrls: [FUJI_RPC],
              blockExplorerUrls: ['https://testnet.snowtrace.io/'],
            }],
          });
          setChainId(FUJI_CHAIN_ID);
        } catch (addError: any) {
          showToast('Failed to add network: ' + addError.message, 'error');
        }
      } else {
        showToast('Failed to switch network: ' + error.message, 'error');
      }
    }
  };

  // ==============================
  // 🔹 READ CONTRACT
  // ==============================
  const readValue = async () => {
    if (!isCorrectNetwork) return;
    
    setIsLoading(true);
    try {
      const data = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESS,
          data: '0x20965255', // getValue() function signature
        }, 'latest'],
      });
      
      const valueInt = parseInt(data, 16);
      setValue(valueInt.toString());
    } catch (error: any) {
      showToast('Failed to read value: ' + error.message, 'error');
    }
    setIsLoading(false);
  };

  const readOwner = async () => {
    if (!isCorrectNetwork) return;
    
    try {
      const data = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESS,
          data: '0x8da5cb5b', // owner() function signature
        }, 'latest'],
      });
      
      const ownerAddress = '0x' + data.slice(-40);
      setOwner(ownerAddress);
    } catch (error: any) {
      console.error('Failed to read owner:', error);
    }
  };

  // ==============================
  // 🔹 WRITE CONTRACT
  // ==============================
  const writeValue = async () => {
    if (!inputValue) {
      showToast('Please enter a value', 'error');
      return;
    }

    if (!isCorrectNetwork) {
      showToast('Please switch to Avalanche Fuji network', 'error');
      return;
    }

    setIsLoading(true);
    setTxStatus('pending');

    try {
      // Encode setValue(uint256) function call
      const valueHex = BigInt(inputValue).toString(16).padStart(64, '0');
      const data = '0x55241077' + valueHex; // setValue(uint256) signature

      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: CONTRACT_ADDRESS,
          data: data,
        }],
      });

      setTxHash(hash);
      showToast('Transaction submitted!', 'info');

      // Wait for confirmation
      const checkReceipt = setInterval(async () => {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        });

        if (receipt) {
          clearInterval(checkReceipt);
          if (receipt.status === '0x1') {
            setTxStatus('confirmed');
            showToast('Transaction confirmed!', 'success');
            setTimeout(() => {
              readValue();
              setInputValue('');
              setTxHash('');
              setTxStatus('');
            }, 2000);
          } else {
            setTxStatus('failed');
            showToast('Transaction failed', 'error');
          }
          setIsLoading(false);
        }
      }, 2000);

    } catch (error: any) {
      setIsLoading(false);
      setTxStatus('');
      
      if (error.code === 4001) {
        showToast('Transaction rejected by user', 'error');
      } else {
        showToast('Transaction failed: ' + error.message, 'error');
      }
    }
  };

  // ==============================
  // 🔹 LISTEN TO ACCOUNT/CHAIN CHANGES
  // ==============================
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chain: string) => {
        setChainId(chain);
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // ==============================
  // 🔹 AUTO READ ON CONNECT
  // ==============================
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      readValue();
      readOwner();
    }
  }, [isConnected, isCorrectNetwork]);

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="w-full max-w-md border border-gray-700 rounded-xl p-6 space-y-6 bg-gray-900/50 backdrop-blur">
        
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Day 3 – dApp Frontend
        </h1>

        {/* TOAST NOTIFICATION */}
        {toast.show && (
          <div className={`p-3 rounded-lg text-sm animate-pulse ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          }`}>
            {toast.message}
          </div>
        )}

        {/* WALLET CONNECT */}
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition"
          >
            🔌 Connect Wallet
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-xs text-gray-400 mb-1">Connected Address</p>
              <p className="font-mono text-sm">{shortenAddress(account)}</p>
            </div>

            {/* NETWORK STATUS */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Network</p>
              <div className="flex items-center gap-2">
                {isCorrectNetwork ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm">Avalanche Fuji ✓</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-sm text-red-400">Wrong Network</span>
                    <button
                      onClick={switchToFuji}
                      className="ml-auto text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Switch to Fuji
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={disconnectWallet}
              className="text-red-400 text-sm underline hover:text-red-300"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* READ CONTRACT */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <p className="text-sm text-gray-400">📖 Contract Data (Read)</p>

          {isLoading && !value ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg">
                <p className="text-xs text-gray-400">Current Value</p>
                <p className="text-3xl font-bold">{value || '0'}</p>
              </div>
              
              {owner && (
                <div className="text-xs text-gray-400">
                  Owner: {shortenAddress(owner)}
                </div>
              )}
            </>
          )}

          <button
            onClick={readValue}
            disabled={!isCorrectNetwork}
            className="text-sm underline text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Refresh Value
          </button>
        </div>

        {/* WRITE CONTRACT */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <p className="text-sm text-gray-400">✍️ Update Contract Value</p>

          <input
            type="number"
            placeholder="Enter new value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />

          <button
            onClick={writeValue}
            disabled={!isConnected || isLoading || !isCorrectNetwork}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txStatus === 'pending' ? '⏳ Waiting for signature...' :
             txStatus === 'confirming' ? '⛏️ Confirming transaction...' :
             isLoading ? '⏳ Processing...' :
             '💾 Set Value'}
          </button>

          {/* TRANSACTION STATUS */}
          {txHash && (
            <div className="p-3 bg-gray-800 rounded-lg space-y-2">
              <p className="text-xs text-gray-400">Transaction Hash</p>
              <a
                href={`https://testnet.snowtrace.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-400 hover:underline break-all block"
              >
                {txHash}
              </a>
              <p className="text-xs">
                {txStatus === 'pending' ? '⏳ Pending...' : 
                 txStatus === 'confirmed' ? '✅ Confirmed!' :
                 txStatus === 'failed' ? '❌ Failed' : ''}
              </p>
            </div>
          )}
        </div>

        {/* FOOTNOTE */}
        <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
          🔐 Smart contract = single source of truth
        </p>
      </div>
    </main>
  );
}