'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MiniApp = dynamic(() => import('../../../../example/mini-app/src/App'), { ssr: false });

const AppPage = () => {
  return (
    <section className='mx-auto flex h-full flex-1 flex-col justify-center'>
      <div className='w-full max-w-[600px] rounded-xl border-1 bg-slate-700 p-4'>
        <MiniApp />
      </div>
    </section>
  );
};

export default AppPage;
