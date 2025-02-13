'use client';
import React, { useState } from 'react';

import { libConfig } from '@/lib/lib-config';
import { formatNumberInput } from '@/lib/utils';

import { ConfigProvider, createTheme, PSADialog } from 'polkadot-sufficient-assets';

const Main = () => {
  const [{ isCrossChain, amount }, setValues] = useState({
    isCrossChain: false,
    amount: '0',
  });
  const theme = createTheme({ palette: { mode: 'light' } });

  return (
    <section className='mx-auto flex h-full flex-1 flex-col justify-center'>
      <div className='w-full max-w-[600px] rounded-xl border-1 bg-black p-4'>
        <ConfigProvider config={{ ...libConfig, useXcmTransfer: isCrossChain }}>
          <div
            style={{
              display: 'flex',
              gap: 6,
            }}
          >
            <div className='input'>
              <input
                value={amount}
                onChange={({ target }) =>
                  setValues((prev) => ({
                    ...prev,
                    amount: formatNumberInput(target.value),
                  }))
                }
                placeholder='Enter your amount'
                min={0}
                type='number'
              />
              <span>{Object.values(libConfig.tokens ?? {})?.[0]?.token?.symbol ?? 'USDT'}</span>
            </div>
            <PSADialog theme={theme} initialAmount={amount}>
              <button type='button' disabled={!amount} className='btn'>
                Pay now
              </button>
            </PSADialog>
          </div>
          {libConfig.destinationChains && libConfig.destinationChains?.length !== 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 12, alignItems: 'center' }}>
              <input
                checked={isCrossChain}
                onChange={(e) => setValues((prev) => ({ ...prev, isCrossChain: e.target.checked }))}
                id='crossChain'
                type='checkbox'
                style={{ width: 20, height: 20, accentColor: 'black' }}
              />
              <label htmlFor='crossChain'>Cross chain</label>
            </div>
          )}
        </ConfigProvider>
      </div>
    </section>
  );
};

export default Main;
