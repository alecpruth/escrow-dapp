"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
  address: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({} as Web3ContextType);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Initialize provider and check for existing connection
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Create provider instance
      const provider = new BrowserProvider(window.ethereum);
      setProvider(provider);

      // Check if already connected
      provider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          handleConnection(provider);
        }
      }).catch(console.error);
    }
  }, []);

  // Handle the actual connection logic
  const handleConnection = async (provider: BrowserProvider) => {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setSigner(signer);
      setAddress(address);
      setChainId(chainId);
      setIsConnected(true);
      setError('');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnected(false);
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      setError('Please install a Web3 wallet');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      if (!provider) {
        const newProvider = new BrowserProvider(window.ethereum);
        setProvider(newProvider);
        await handleConnection(newProvider);
      } else {
        await handleConnection(provider);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setChainId(null);
    setIsConnected(false);
    setError('');
  };

  // Setup event listeners for wallet state changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (provider) {
          handleConnection(provider);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('disconnect', () => {
        disconnect();
      });

      return () => {
        window.ethereum.removeListener('accountsChanged', disconnect);
        window.ethereum.removeListener('chainChanged', () => {});
        window.ethereum.removeListener('disconnect', disconnect);
      };
    }
  }, [provider]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        chainId,
        address,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);