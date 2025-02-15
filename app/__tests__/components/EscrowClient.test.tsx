import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EscrowClient from '../../components/EscrowClient';

// Create actual mock objects instead of just mock functions
const mockUseWeb3 = vi.fn();
const mockUseEscrow = vi.fn();

// Mock the entire modules
vi.mock('../../providers/Web3Provider', () => ({
  useWeb3: () => mockUseWeb3()
}));

vi.mock('../../hooks/useEscrow', () => ({
  useEscrow: () => mockUseEscrow()
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  LockKeyhole: () => <div data-testid="lock-icon" />,
}));

describe('EscrowClient', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set default mock implementations
    mockUseWeb3.mockReturnValue({
      isConnected: false,
      isConnecting: false,
      error: '',
      connect: vi.fn(),
      address: '',
    });

    mockUseEscrow.mockReturnValue({
      price: '1.0',
      isPaid: false,
      isConfirmed: false,
      isLoading: false,
      error: '',
      deposit: vi.fn(),
      confirmGoods: vi.fn(),
      releasePayment: vi.fn(),
    });
  });

  describe('Wallet Connection State', () => {
    it('shows connect wallet screen when not connected', () => {
      mockUseWeb3.mockReturnValue({
        isConnected: false,
        isConnecting: false,
        error: '',
        connect: vi.fn(),
        address: '',
      });

      render(<EscrowClient />);
      expect(screen.getByText('Secure Escrow Service')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
    });

    it('shows loading state while connecting', () => {
      mockUseWeb3.mockReturnValue({
        isConnected: false,
        isConnecting: true,
        error: '',
        connect: vi.fn(),
        address: '',
      });

      render(<EscrowClient />);
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('shows wallet error when connection fails', () => {
      mockUseWeb3.mockReturnValue({
        isConnected: false,
        isConnecting: false,
        error: 'Failed to connect wallet',
        connect: vi.fn(),
        address: '',
      });

      render(<EscrowClient />);
      expect(screen.getByText('Failed to connect wallet')).toBeInTheDocument();
    });
  });

  describe('Connected State UI', () => {
    beforeEach(() => {
      // Set connected state for these tests
      mockUseWeb3.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: '',
        connect: vi.fn(),
        address: '0x1234...5678',
      });
    });

    it('shows transaction status when connected', () => {
      render(<EscrowClient />);
      expect(screen.getByText(/transaction status/i)).toBeInTheDocument();
      expect(screen.getByText('1.0 ETH')).toBeInTheDocument();
    });

    it('displays correct payment status badge', () => {
      mockUseEscrow.mockReturnValue({
        price: '1.0',
        isPaid: true,
        isConfirmed: false,
        isLoading: false,
        error: '',
        deposit: vi.fn(),
        confirmGoods: vi.fn(),
        releasePayment: vi.fn(),
      });

      render(<EscrowClient />);
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });

    it('displays correct confirmation status badge', () => {
      mockUseEscrow.mockReturnValue({
        price: '1.0',
        isPaid: true,
        isConfirmed: true,
        isLoading: false,
        error: '',
        deposit: vi.fn(),
        confirmGoods: vi.fn(),
        releasePayment: vi.fn(),
      });

      render(<EscrowClient />);
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });
  });

  describe('Transaction Actions', () => {
    beforeEach(() => {
      // Set connected state for these tests
      mockUseWeb3.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: '',
        connect: vi.fn(),
        address: '0x1234...5678',
      });
    });

    it('enables deposit button when not paid', () => {
      const deposit = vi.fn();
      mockUseEscrow.mockReturnValue({
        price: '1.0',
        isPaid: false,
        isConfirmed: false,
        isLoading: false,
        error: '',
        deposit,
        confirmGoods: vi.fn(),
        releasePayment: vi.fn(),
      });

      render(<EscrowClient />);
      const depositButton = screen.getByRole('button', { name: /send payment/i });
      expect(depositButton).not.toBeDisabled();
      fireEvent.click(depositButton);
      expect(deposit).toHaveBeenCalled();
    });

    it('disables confirm button when not paid', () => {
      render(<EscrowClient />);
      const confirmButton = screen.getByRole('button', { name: /confirm receipt/i });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUseWeb3.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: '',
        connect: vi.fn(),
        address: '0x1234...5678',
      });
    });

    it('displays contract errors', () => {
      mockUseEscrow.mockReturnValue({
        price: '1.0',
        isPaid: false,
        isConfirmed: false,
        isLoading: false,
        error: 'Transaction failed',
        deposit: vi.fn(),
        confirmGoods: vi.fn(),
        releasePayment: vi.fn(),
      });

      render(<EscrowClient />);
      expect(screen.getByText('Transaction failed')).toBeInTheDocument();
    });
  });
});