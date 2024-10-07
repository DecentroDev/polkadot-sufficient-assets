import { useContext } from 'react';
import { TransferContext } from '../context/transfer.context';

export function useTransfer() {
  const transfer = useContext(TransferContext);
  if (!transfer) throw new Error('TransferProvider not found');
  return transfer;
}
