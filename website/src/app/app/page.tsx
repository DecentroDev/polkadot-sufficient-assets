import dynamic from 'next/dynamic';
import React from 'react';

const Main = dynamic(() => import('@/app/app/_components/main'), { ssr: false });

const App = () => {
  return <Main></Main>;
};

export default App;
