// app/page.tsx
"use client";

import EscrowClient from "./components/EscrowClient";
import { Shield, Lock, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-blue-600">EscrowPay</h1>
            <div className="text-sm text-gray-500">Secure Digital Transactions</div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Escrow</h3>
              <p className="text-sm text-gray-500">Your funds are protected until goods are received</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Smart Contracts</h3>
              <p className="text-sm text-gray-500">Automated and transparent transactions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Instant Release</h3>
              <p className="text-sm text-gray-500">Quick payment release upon confirmation</p>
            </div>
          </div>
        </div>

        <EscrowClient />
      </div>
    </main>
  );
}