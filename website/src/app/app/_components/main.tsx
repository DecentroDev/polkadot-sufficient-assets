'use client';
import React, { useMemo, useState } from 'react';

import { dotUSDTConfig, pahUSDCConfig, pahUSDTConfig } from '@/lib/lib-config';
import { formatNumberInput } from '@/lib/utils';

import { ConfigProvider, createTheme, PSADialog } from 'polkadot-sufficient-assets';

const options = ['USDT', 'USDC', 'DOT'];

const Main = () => {
  const [{ isCrossChain, amount }, setValues] = useState({
    isCrossChain: false,
    amount: '0',
  });

  const [selectedOption, setSelectedOption] = useState(options[0]);

  const theme = createTheme({ palette: { mode: 'light' } });

  const config = useMemo(() => {
    switch (selectedOption) {
      case 'USDT':
        return pahUSDTConfig;
      case 'USDC':
        return pahUSDCConfig;
      case 'DOT':
        return dotUSDTConfig;
      default:
        return dotUSDTConfig;
    }
  }, [selectedOption]);

  return (
    <section className='mx-auto flex h-full flex-1 flex-col justify-center'>
      <div className='w-full max-w-[600px] rounded-xl border-1 bg-black p-4'>
        <ConfigProvider config={{ ...config, useXcmTransfer: isCrossChain }}>
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
              {/* <span>{Object.values(libConfig.tokens ?? {})?.[0]?.token?.symbol ?? 'USDT'}</span> */}

              <select className='h-full rounded-lg' onChange={(e) => setSelectedOption(e.target.value)}>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <PSADialog theme={theme} initialAmount={amount}>
              <button type='button' disabled={!amount} className='btn'>
                Send
              </button>
            </PSADialog>
          </div>
          {config.destinationChains && config.destinationChains?.length !== 0 && (
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
