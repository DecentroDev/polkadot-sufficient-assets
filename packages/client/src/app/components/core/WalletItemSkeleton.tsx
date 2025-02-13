import Skeleton from '@mui/material/Skeleton';

interface WalletItemSkeletonProps {
  length?: number;
}

const WalletItemSkeleton = ({ length = 4 }: WalletItemSkeletonProps) => {
  const validLength = Math.max(length, 0);

  return (
    <>
      {Array.from({ length: validLength }).map((_, i) => (
        <Skeleton key={i} variant='rounded' width={'100%'} height={65} sx={{ mt: 1 }} />
      ))}
    </>
  );
};

export default WalletItemSkeleton;
