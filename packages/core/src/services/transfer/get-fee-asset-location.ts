import { XcmV3Junction, XcmV3Junctions } from '@polkadot-api/descriptors';
import type { Pair } from '../../utils/xcm-v3-multi-location';
import { isApiAssetHub, type Api } from '../api';
import type { ChainIdAssetHub } from '../chains';
import type { Token } from '../tokens';
import { fetchAssetConvertionPool, type AssetConvertionPoolDef } from './reserve-pool';

export const getFeeAssetLocation = (feeToken: Token) => {
  if (!feeToken.isSufficient) throw new Error(`Token ${feeToken.symbol} (${feeToken.assetId}) is not sufficient`);

  if (feeToken.assetId && feeToken.type !== 'native') {
    return {
      parents: 0,
      interior: XcmV3Junctions.X2([
        XcmV3Junction.PalletInstance(50),
        XcmV3Junction.GeneralIndex(BigInt(feeToken.assetId)),
      ]),
    };
  }
  return undefined;
};

export const getBalance = async (api: Api<ChainIdAssetHub>, token: Token | Pair, address: string) => {
  switch (token.type) {
    case 'native': {
      const account = await api.query.System.Account.getValue(address, {
        at: 'best',
      });
      return account.data.free - account.data.frozen;
    }
    case 'asset': {
      if (!isApiAssetHub(api) || !token.assetId)
        throw new Error(`Cannot watch balance for ${token.assetId}. Assets are not supported on ${api.chainId}`);

      const account = await api.query.Assets.Account.getValue(token.assetId, address, {
        at: 'best',
      });
      return account?.status.type === 'Liquid' ? account.balance : 0n;
    }

    case 'foreign-asset': {
      if (!isApiAssetHub(api) || !token.assetId)
        throw new Error(`Cannot watch balance for ${token.assetId}. Assets are not supported on ${api.chainId}`);

      const account = await api.query.ForeignAssets.Account.getValue(token.location, address, {
        at: 'best',
      });
      return account?.status.type === 'Liquid' ? account.balance : 0n;
    }

    default: {
      return 0n;
    }
  }
};
export const isTokenEqualPair = (token: Token, pair: Pair) => {
  return token.assetId === pair.assetId && token.type === pair.type;
};

export const getPoolReservesByToken = async (
  api: Api<ChainIdAssetHub>,
  nativeToken: Token,
  token: Token,
  pools: AssetConvertionPoolDef[]
): Promise<[bigint, bigint] | null> => {
  const pool = pools.find(
    (p) =>
      p.tokenIds.some((x) => isTokenEqualPair(nativeToken, x)) && p.tokenIds.some((x) => isTokenEqualPair(token, x))
  );

  if (!pool) return null;

  const nativeTokenBalance = await getBalance(api, pool.tokenIds[0], pool.owner);
  const tokenBalance = await getBalance(api, pool.tokenIds[1], pool.owner);

  const reserves = [nativeTokenBalance, tokenBalance] as [bigint, bigint];

  return reserves
    ? nativeToken.type === 'native'
      ? reserves // native to asset
      : (reserves.slice().reverse() as [bigint, bigint]) // asset to native
    : null;
};

export const getAssetConvertPlancks = async (
  api: Api<ChainIdAssetHub>,
  params: {
    plancks?: bigint;
    tokenIn?: Token;
    tokenOut?: Token;
    nativeToken?: Token;
  }
) => {
  const { nativeToken, plancks, tokenIn, tokenOut } = params;

  if (!tokenIn || !tokenOut || !nativeToken || !plancks) return undefined;

  if (tokenIn.assetId === tokenOut.assetId) return plancks;

  const pools = await fetchAssetConvertionPool(api as Api<ChainIdAssetHub>);

  const poolNativeIn = await getPoolReservesByToken(api, nativeToken, tokenIn, pools);
  const poolNativeOut = await getPoolReservesByToken(api, nativeToken, tokenOut, pools);

  const reservesNativeToTokenIn = nativeToken.assetId !== tokenIn.assetId ? poolNativeIn : [1n, 1n];
  const reservesNativeToTokenOut = nativeToken.assetId !== tokenOut.assetId ? poolNativeOut : [1n, 1n];

  if (!reservesNativeToTokenIn || !reservesNativeToTokenOut) return undefined;

  if ([...reservesNativeToTokenOut, ...reservesNativeToTokenIn].includes(0n)) return undefined;

  if (nativeToken.assetId !== tokenOut.assetId && !reservesNativeToTokenOut) return undefined;

  const [nativeToTokenOutReserveIn, nativeToTokenOutReserveOut] =
    nativeToken.assetId !== tokenOut.assetId ? reservesNativeToTokenOut : [1n, 1n];

  if (tokenIn.assetId === nativeToken.assetId) {
    const stablePlancks = (plancks * nativeToTokenOutReserveOut) / nativeToTokenOutReserveIn;
    return stablePlancks;
  }

  if (!reservesNativeToTokenIn || reservesNativeToTokenIn?.includes(0n)) return undefined;

  const [nativeToTokenInReserveIn, nativeToTokenInReserveOut] = reservesNativeToTokenIn;

  const nativePlancks = (plancks * nativeToTokenInReserveIn) / nativeToTokenInReserveOut;

  const outPlancks = (nativePlancks * nativeToTokenOutReserveOut) / nativeToTokenOutReserveIn;

  return outPlancks;
};
