import { Icons } from '@/assets/icons';
import { HStack } from '@/components/h-stack';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const HomePage = () => {
  return (
    <section className='flex h-full flex-1 flex-col items-center justify-center'>
      <h1 className='text-center font-bold font-mono text-5xl'>Polkadot Sufficient Assets</h1>
      <div className='my-6 max-w-[650px] text-center text-lg'>
        A frictionless UI Library to integrate Polkadot sufficient assets into your dApp, enabling transaction fees to
        be paid in stablecoins.
      </div>

      <HStack pos='center' className='mt-6'>
        <Link href='/docs'>
          <Button>Documents</Button>
        </Link>
        <a href='https://github.com/DecentroDev/polkadot-sufficient-assets' target='_blank' rel='noopener noreferrer'>
          <Button variant='outline'>
            <Icons.github /> Github
          </Button>
        </a>
      </HStack>

      <div className='my-8 flex items-center gap-2 text-sm italic'>developed by</div>

      <a href='https://x.com/PRMX_2024' target='_blank' rel='noopener noreferrer'>
        <img
          src='https://decentrodev.github.io/polkadot-sufficient-assets/prmx.svg'
          className='max-w-full'
          width={150}
        />
      </a>
    </section>
  );
};

export default HomePage;
