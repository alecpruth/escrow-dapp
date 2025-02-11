"use client;"

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const escrowAddress: string = "0xYourDeployedContractAddress"; // Replace with actual contract address
const escrowABI: string[] = [
  "function deposit() external payable",
  "function confirmGoodsReceived() external",
  "function releasePayment() external",
  "function price() view returns (uint256)",
  "function isPaid() view returns (bool)",
  "function isConfirmed() view returns (bool)"
];

export default function EscrowClient() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [price, setPrice] = useState<string>("0");
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (!window.ethereum) return;
    const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(providerInstance);
    setSigner(providerInstance.getSigner());
    const contractInstance = new ethers.Contract(escrowAddress, escrowABI, providerInstance);
    setContract(contractInstance);
  }, []);

  useEffect(() => {
    if (!contract) return;
    async function fetchData() {
      const price = await contract.price();
      setPrice(ethers.utils.formatEther(price));
      setIsPaid(await contract.isPaid());
      setIsConfirmed(await contract.isConfirmed());
    }
    fetchData();
  }, [contract]);

  const deposit = async () => {
    if (!contract || !signer) return;
    const tx = await contract.connect(signer).deposit({ value: ethers.utils.parseEther(price) });
    await tx.wait();
    alert("Payment deposited");
  };

  const confirmGoods = async () => {
    if (!contract || !signer) return;
    const tx = await contract.connect(signer).confirmGoodsReceived();
    await tx.wait();
    alert("Goods confirmed");
  };

  const releasePayment = async () => {
    if (!contract || !signer) return;
    const tx = await contract.connect(signer).releasePayment();
    await tx.wait();
    alert("Payment released to seller");
  };

  return (
    <div className="p-4 max-w-md mx-auto border rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Escrow Contract</h2>
      <p>Price: {price} ETH</p>
      <p>Status: {isPaid ? "Paid" : "Not Paid"} | {isConfirmed ? "Confirmed" : "Not Confirmed"}</p>
      <button onClick={deposit} className="bg-blue-500 text-white p-2 rounded mt-2">Deposit</button>
      <button onClick={confirmGoods} className="bg-green-500 text-white p-2 rounded mt-2">Confirm Goods</button>
      <button onClick={releasePayment} className="bg-red-500 text-white p-2 rounded mt-2">Release Payment</button>
    </div>
  );
}
