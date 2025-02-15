"use client";
// app/providers/Web3Provider.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
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
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connect = async () => {
    if (!window.ethereum) {
      setError('Please install a Web3 wallet');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const accounts = await providerInstance.send("eth_requestAccounts", []);
      const signerInstance = await providerInstance.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(providerInstance);
      setSigner(signerInstance);
      setAddress(address);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setIsConnected(false);
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        disconnect();
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', disconnect);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
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