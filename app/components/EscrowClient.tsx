"use client";
import { useWeb3 } from '../providers/Web3Provider';
import { useEscrow } from '../hooks/useEscrow';
import { ArrowRight, Wallet, CheckCircle2, LockKeyhole } from 'lucide-react';

export default function EscrowClient() {
  const { isConnected, isConnecting, error: walletError, connect, address } = useWeb3();
  const {
    price,
    isPaid,
    isConfirmed,
    isLoading,
    error: contractError,
    deposit,
    confirmGoods,
    releasePayment
  } = useEscrow();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Secure Escrow Service</h2>
            <p className="mt-2 text-gray-600">Safe and secure transactions for digital goods</p>
          </div>
          
          {walletError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{walletError}</p>
            </div>
          )}

          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-blue-500 text-white rounded-full py-3 px-4 flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors duration-200"
          >
            <Wallet className="w-5 h-5" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Transaction Status</h2>
            <p className="text-sm text-gray-500">Current escrow state</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Connected as</div>
            <div className="text-sm font-medium text-gray-900">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Price</div>
                <div className="text-lg font-semibold text-blue-600">{price} ETH</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isPaid ? 'Paid' : 'Awaiting Payment'}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Confirmation</div>
                <div className="text-sm text-gray-500">Buyer must confirm receipt</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isConfirmed ? 'Confirmed' : 'Pending'}
            </div>
          </div>
        </div>

        {contractError && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{contractError}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={deposit}
          disabled={isLoading || isPaid}
          className="w-full bg-blue-500 text-white rounded-full py-3 px-4 flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-5 h-5" />
          <span>{isLoading ? "Processing..." : "Send Payment"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={confirmGoods}
          disabled={isLoading || !isPaid || isConfirmed}
          className="w-full bg-purple-500 text-white rounded-full py-3 px-4 flex items-center justify-center space-x-2 hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isLoading ? "Processing..." : "Confirm Receipt"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={releasePayment}
          disabled={isLoading || !isPaid || !isConfirmed}
          className="w-full bg-green-500 text-white rounded-full py-3 px-4 flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LockKeyhole className="w-5 h-5" />
          <span>{isLoading ? "Processing..." : "Release Payment"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}