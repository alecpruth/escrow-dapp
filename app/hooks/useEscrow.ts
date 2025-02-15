// app/hooks/useEscrow.ts
import { useState, useEffect } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import { useWeb3 } from '../providers/Web3Provider';

const ESCROW_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const ESCROW_ABI = [
  "function deposit() external payable",
  "function confirmGoodsReceived() external",
  "function releasePayment() external",
  "function price() view returns (uint256)",
  "function isPaid() view returns (bool)",
  "function isConfirmed() view returns (bool)"
] as const;

export function useEscrow() {
  const { signer, isConnected } = useWeb3();
  const [contract, setContract] = useState<Contract | null>(null);
  const [price, setPrice] = useState<string>("0");
  const [isPaid, setIsPaid] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (signer) {
      const contractInstance = new Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      setContract(contractInstance);
    }
  }, [signer]);

  useEffect(() => {
    if (contract && isConnected) {
      fetchContractData();
    }
  }, [contract, isConnected]);

  const fetchContractData = async () => {
    if (!contract) return;

    try {
      const [priceValue, paidStatus, confirmedStatus] = await Promise.all([
        contract.price(),
        contract.isPaid(),
        contract.isConfirmed()
      ]);

      setPrice(formatEther(priceValue));
      setIsPaid(paidStatus);
      setIsConfirmed(confirmedStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contract data");
    }
  };

  const deposit = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError("");

    try {
      const tx = await contract.deposit({ value: parseEther(price) });
      await tx.wait();
      await fetchContractData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmGoods = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError("");

    try {
      const tx = await contract.confirmGoodsReceived();
      await tx.wait();
      await fetchContractData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const releasePayment = async () => {
    if (!contract) return;
    setIsLoading(true);
    setError("");

    try {
      const tx = await contract.releasePayment();
      await tx.wait();
      await fetchContractData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment release failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    price,
    isPaid,
    isConfirmed,
    isLoading,
    error,
    deposit,
    confirmGoods,
    releasePayment
  };
}