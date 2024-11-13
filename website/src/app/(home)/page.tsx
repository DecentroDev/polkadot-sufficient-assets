import { Icons } from '@/assets/icons';
import { HStack } from '@/components/h-stack';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const HomePage = () => {
  return (
    <section className='flex h-full flex-1 flex-col items-center justify-center'>
      <h1 className='text-center font-bold font-mono text-5xl'>Polkadot Sufficient Assets</h1>
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
    </section>
  );
};

export default HomePage;
