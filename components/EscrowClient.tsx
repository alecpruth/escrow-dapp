"use client";
import { useState, useEffect } from "react";
import { ethers, BrowserProvider, Contract, JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ESCROW_ADDRESS = "0xYourDeployedContractAddress";
const ESCROW_ABI = [
  "function deposit() external payable",
  "function confirmGoodsReceived() external",
  "function releasePayment() external",
  "function price() view returns (uint256)",
  "function isPaid() view returns (bool)",
  "function isConfirmed() view returns (bool)"
] as const;

type EscrowContract = Contract & {
  deposit(overrides?: { value: bigint }): Promise<any>;
  confirmGoodsReceived(): Promise<any>;
  releasePayment(): Promise<any>;
  price(): Promise<bigint>;
  isPaid(): Promise<boolean>;
  isConfirmed(): Promise<boolean>;
}

export default function EscrowClient() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<EscrowContract | null>(null);
  const [price, setPrice] = useState<string>("0");
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("No wallet detected! Please install an Ethereum wallet");
      }

      const providerInstance = new BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await providerInstance.send("eth_requestAccounts", []);
      const signerInstance = await providerInstance.getSigner();
      
      // Initialize contract
      const contractInstance = new Contract(
        ESCROW_ADDRESS, 
        ESCROW_ABI, 
        signerInstance
      ) as EscrowContract;

      setProvider(providerInstance);
      setSigner(signerInstance);
      setContract(contractInstance);
      setIsConnected(true);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      setIsConnected(false);
    }
  };

  // Fetch contract data when contract is initialized
  useEffect(() => {
    async function fetchContractData() {
      if (!contract) return;

      try {
        const [priceValue, paidStatus, confirmedStatus] = await Promise.all([
          contract.price(),
          contract.isPaid(),
          contract.isConfirmed()
        ]);

        setPrice(ethers.formatEther(priceValue));
        setIsPaid(paidStatus);
        setIsConfirmed(confirmedStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch contract data");
      }
    }

    if (contract) {
      fetchContractData();
    }
  }, [contract]);

  const handleTransaction = async (
    transaction: () => Promise<any>,
    successMessage: string
  ) => {
    setIsLoading(true);
    setError("");
    
    try {
      const tx = await transaction();
      await tx.wait();
      // Refresh contract state
      if (contract) {
        const [priceValue, paidStatus, confirmedStatus] = await Promise.all([
          contract.price(),
          contract.isPaid(),
          contract.isConfirmed()
        ]);
        setPrice(ethers.formatEther(priceValue));
        setIsPaid(paidStatus);
        setIsConfirmed(confirmedStatus);
      }
      alert(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const deposit = () => handleTransaction(
    async () => {
      if (!contract || !signer) throw new Error("Contract not initialized");
      return contract.deposit({ value: ethers.parseEther(price) });
    },
    "Payment deposited successfully"
  );

  const confirmGoods = () => handleTransaction(
    async () => {
      if (!contract || !signer) throw new Error("Contract not initialized");
      return contract.confirmGoodsReceived();
    },
    "Goods confirmed successfully"
  );

  const releasePayment = () => handleTransaction(
    async () => {
      if (!contract || !signer) throw new Error("Contract not initialized");
      return contract.releasePayment();
    },
    "Payment released to seller successfully"
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Escrow dApp</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
          
          <p className="mt-4 text-sm text-gray-600 text-center">
            Please connect your Ethereum wallet to use this application
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto border rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Escrow Contract</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2 mb-4">
        <p className="font-medium">Price: {price} ETH</p>
        <p className="font-medium">
          Status: {isPaid ? "Paid" : "Not Paid"} | {isConfirmed ? "Confirmed" : "Not Confirmed"}
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={deposit}
          disabled={isLoading || isPaid}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Deposit"}
        </button>

        <button
          onClick={confirmGoods}
          disabled={isLoading || !isPaid || isConfirmed}
          className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Confirm Goods"}
        </button>

        <button
          onClick={releasePayment}
          disabled={isLoading || !isPaid || !isConfirmed}
          className="w-full bg-red-500 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Release Payment"}
        </button>
      </div>
    </div>
  );
}