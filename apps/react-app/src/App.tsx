import { MultiAddress, useApi, useWallet } from '@polkadot-sufficient-assets/react';
import { type ChangeEventHandler, useEffect, useState } from 'react';
import './App.css';
const TOKEN_ID = 4;
const TOKEN_DECIMAL = 10n;

function App() {
  const [api, loaded] = useApi('paseoah');

  const {
    getInjectedWalletIds,
    account,
    setAccount,
    setWallet,
    connect,
    connected,
    connectedWallets,
    disconnect,
    accounts,
    wallet,
  } = useWallet();

  const [extensions, setExtensions] = useState<string[]>([]);

  const [to, setTo] = useState<string>('15AQtmyQVd3aufEe38T2AyuBTrhy4WrJqLf6H8jaV145oFNj');
  const [amount, setAmount] = useState<string>('0');
  const [balance, setBalance] = useState<bigint>();
  const [feeBalance, setFeeBalance] = useState<bigint>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const wallets = getInjectedWalletIds();
    setExtensions(wallets);
  }, [getInjectedWalletIds]);

  useEffect(() => {
    if (!account?.address || !loaded) return;
    const subscription = api.query.Assets.Account.watchValue(TOKEN_ID, account?.address).subscribe((assetAccount) => {
      setBalance(assetAccount?.balance ?? 0n);
    });

    subscription.add(
      api.query.System.Account.watchValue(account?.address).subscribe((res) => {
        setFeeBalance(res.data.free ?? 0n);
      })
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [account?.address, loaded]);

  const handleAccountChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const value = e.target.value;
    const [selectedWallet, address] = value.split(':');
    setWallet(selectedWallet);

    const findAccount = accounts[selectedWallet].find((x) => x.address === address)!;
    setAccount(findAccount);
  };

  const handleSend = async () => {
    if (!to || !amount || !account || !loaded) return;
    setLoading(true);
    api.tx.Assets.transfer_keep_alive({
      id: TOKEN_ID,
      amount: BigInt(amount) * 10n ** TOKEN_DECIMAL,
      target: MultiAddress.Id(to),
    })
      .signAndSubmit(account.polkadotSigner)
      .then((result) => {
        console.log('Transaction successful:', result);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Transaction failed:', error);
        setLoading(false);
      });
  };

  return (
    <>
      <h1>TEST PAPI</h1>

      <div style={{ display: 'flex', gap: 10 }}>
        {extensions.map((x) => (
          <button onClick={() => (connectedWallets?.includes(x) ? disconnect(x) : connect(x))} key={x}>
            {connectedWallets?.includes(x) ? 'Disconnect ' + x : 'Connect ' + x}
          </button>
        ))}
      </div>
      {connected ? (
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 10,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 10,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <label htmlFor='account'>From Account</label>
            <select value={account ? `${wallet}:${account.address}` : ''} onChange={handleAccountChange} id='account'>
              <option value=''>Select account</option>
              {Object.keys(accounts || {}).map((wallet) => {
                return accounts[wallet].map((account) => (
                  <option key={wallet + account.address} value={`${wallet}:${account.address}`}>
                    {`(${account.name}) - ${wallet}:${account.address}`}
                  </option>
                ));
              })}
            </select>
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 10,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <label htmlFor='account'>To Account</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} id='account'>
              <option value=''>Select account</option>
              {Object.keys(accounts || {}).map((wallet) => {
                return accounts[wallet].map((account) => (
                  <option key={wallet + account.address} value={account.address}>
                    {`(${account.name}) - ${wallet}:${account.address}`}
                  </option>
                ));
              })}
            </select>
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 10,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <label htmlFor='account'>Amount (VAR 2 USD)</label>
            <input type='number' value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div>
            <div style={{ textAlign: 'left' }}>
              <p>Balance: {balance?.toString()} (VAR 2 USD)</p>
              <p>Fee Balance: {feeBalance?.toString()} (PAS)</p>
            </div>
          </div>
        </div>
      ) : null}

      <button disabled={loading} onClick={handleSend}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </>
  );
}

export default App;
