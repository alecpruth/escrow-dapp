import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EscrowClient from './EscrowClient';
import { Contract, BrowserProvider } from 'ethers';

// Mock ethers
vi.mock('ethers', () => ({
  BrowserProvider: vi.fn(),
  Contract: vi.fn(),
  formatEther: vi.fn((val) => val.toString()),
  parseEther: vi.fn((val) => BigInt(val)),
}));

describe('EscrowClient', () => {
  // Mock contract responses
  const mockContract = {
    price: vi.fn(() => Promise.resolve(BigInt(1000000000000000000))), // 1 ETH
    isPaid: vi.fn(() => Promise.resolve(false)),
    isConfirmed: vi.fn(() => Promise.resolve(false)),
    deposit: vi.fn(() => Promise.resolve({ wait: () => Promise.resolve() })),
    confirmGoodsReceived: vi.fn(() => Promise.resolve({ wait: () => Promise.resolve() })),
    releasePayment: vi.fn(() => Promise.resolve({ wait: () => Promise.resolve() })),
  };

  // Mock provider and signer
  const mockProvider = {
    getSigner: vi.fn(() => Promise.resolve({
      connect: vi.fn(),
    })),
    send: vi.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup window.ethereum mock
    global.window.ethereum = {
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    // Setup mock implementations
    (BrowserProvider as any).mockImplementation(() => mockProvider);
    (Contract as any).mockImplementation(() => mockContract);
  });

  it('renders without crashing', () => {
    render(<EscrowClient />);
    expect(screen.getByText('Escrow Contract')).toBeInTheDocument();
  });

  it('shows MetaMask error when ethereum is not available', () => {
    delete global.window.ethereum;
    render(<EscrowClient />);
    expect(screen.getByText('Please install MetaMask to use this application')).toBeInTheDocument();
  });

  it('initializes contract and loads data', async () => {
    console.log('Starting test');
    
    render(<EscrowClient />);
    console.log('Component rendered');
    
    await waitFor(() => {
      console.log('Inside waitFor');
      expect(mockContract.price).toHaveBeenCalled();
      console.log('price called:', mockContract.price.mock.calls.length);
      expect(mockContract.isPaid).toHaveBeenCalled();
      console.log('isPaid called:', mockContract.isPaid.mock.calls.length);
      expect(mockContract.isConfirmed).toHaveBeenCalled();
      console.log('isConfirmed called:', mockContract.isConfirmed.mock.calls.length);
    });

    console.log('After waitFor');
    console.log('Current document body:', document.body.innerHTML);

    const priceElement = screen.getByText((content) => {
        console.log('Checking content:', content);
        return content.includes('Price:');
    });
    expect(priceElement).toBeInTheDocument();
  });

  it('handles deposit action', async () => {
    render(<EscrowClient />);
    
    const depositButton = screen.getByText('Deposit');
    await fireEvent.click(depositButton);

    await waitFor(() => {
      expect(mockContract.deposit).toHaveBeenCalled();
    });
  });

  it('handles confirm goods action', async () => {
    mockContract.isPaid.mockResolvedValueOnce(true);
    render(<EscrowClient />);
    
    const confirmButton = screen.getByText('Confirm Goods');
    await fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockContract.confirmGoodsReceived).toHaveBeenCalled();
    });
  });

  it('handles release payment action', async () => {
    mockContract.isPaid.mockResolvedValueOnce(true);
    mockContract.isConfirmed.mockResolvedValueOnce(true);
    render(<EscrowClient />);
    
    const releaseButton = screen.getByText('Release Payment');
    await fireEvent.click(releaseButton);

    await waitFor(() => {
      expect(mockContract.releasePayment).toHaveBeenCalled();
    });
  });

  it('handles errors during contract initialization', async () => {
    mockProvider.getSigner.mockRejectedValueOnce(new Error('Failed to get signer'));
    render(<EscrowClient />);

    await waitFor(() => {
      expect(screen.getByText('Failed to get signer')).toBeInTheDocument();
    });
  });

  it('handles transaction errors', async () => {
    mockContract.deposit.mockRejectedValueOnce(new Error('Transaction failed'));
    render(<EscrowClient />);

    const depositButton = screen.getByText('Deposit');
    await fireEvent.click(depositButton);

    await waitFor(() => {
      expect(screen.getByText('Transaction failed')).toBeInTheDocument();
    });
  });

  it('disables buttons appropriately based on contract state', async () => {
    render(<EscrowClient />);

    await waitFor(() => {
      const confirmButton = screen.getByText('Confirm Goods');
      const releaseButton = screen.getByText('Release Payment');
      
      expect(confirmButton).toBeDisabled();
      expect(releaseButton).toBeDisabled();
    });
  });
});