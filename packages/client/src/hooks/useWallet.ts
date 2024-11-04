import { useContext } from 'react';
import { WalletContext } from '../context/wallet.context';

export function useWallet() {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error('WalletProvider not found');
  return wallet;
}
