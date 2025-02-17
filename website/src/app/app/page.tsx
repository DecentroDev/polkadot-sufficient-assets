import dynamic from 'next/dynamic';
import React from 'react';

const Main = dynamic(() => import('@/app/app/_components/main'), { ssr: false });

const App = () => {
  return (
    <div className='flex h-full flex-1 flex-col'>
      <Main></Main>
    </div>
  );
};

export default App;
