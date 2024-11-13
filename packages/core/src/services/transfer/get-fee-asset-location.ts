import { XcmV3Junction, XcmV3Junctions } from '@polkadot-api/descriptors';
import { getAssetIdByChain } from '../../utils';
import type { Pair } from '../../utils/xcm-v3-multi-location';
import { isApiAssetHub, type Api } from '../api';
import type { ChainId, ChainIdAssetHub } from '../chains';
import type { Token } from '../tokens';
import { fetchAssetConvertionPool, type AssetConvertionPool } from './reserve-pool';

export const getFeeAssetLocation = (feeToken: Token, chainId: ChainId) => {
  if (!feeToken.isSufficient) throw new Error(`Token ${feeToken.symbol} (${feeToken.assetId}) is not sufficient`);
  const assetId = getAssetIdByChain(feeToken, chainId);
  if (assetId && feeToken.type !== 'native') {
    return {
      parents: 0,
      interior: XcmV3Junctions.X2([XcmV3Junction.PalletInstance(50), XcmV3Junction.GeneralIndex(BigInt(assetId))]),
    };
  }
  return undefined;
};

export const getPairBalance = async (api: Api<ChainIdAssetHub>, pair: Pair, address: string) => {
  switch (pair.type) {
    case 'native': {
      const account = await api.query.System.Account.getValue(address, {
        at: 'best',
      });
      return account.data.free - account.data.frozen;
    }
    case 'asset': {
      if (!isApiAssetHub(api) || !pair.assetId)
        throw new Error(`Cannot watch balance for ${pair.assetId}. Assets are not supported on ${api.chainId}`);

      const account = await api.query.Assets.Account.getValue(pair.assetId, address, {
        at: 'best',
      });
      return account?.status.type === 'Liquid' ? account.balance : 0n;
    }

    case 'foreign-asset': {
      if (!isApiAssetHub(api) || !pair.assetId)
        throw new Error(`Cannot watch balance for ${pair.assetId}. Assets are not supported on ${api.chainId}`);
      return 0n;
      // const account = await api.query.ForeignAssets.Account.getValue(token.location, address, {
      //   at: 'best',
      // });
      // return account?.status.type === 'Liquid' ? account.balance : 0n;
    }

    default: {
      return 0n;
    }
  }
};
export const isTokenEqualPair = (token: Token, pair: Pair, chainId: ChainId) => {
  const assetId = getAssetIdByChain(token, chainId);
  return assetId?.toString() === pair.assetId?.toString() && token.type?.toString() === pair.type?.toString();
};

export const getPoolReservesByToken = async (
  api: Api<ChainIdAssetHub>,
  nativeToken: Token,
  token: Token,
  pools: AssetConvertionPool[]
): Promise<[bigint, bigint] | null> => {
  const pool = pools.find(
    (p) =>
      p.tokenIds.some((x) => isTokenEqualPair(nativeToken, x, api.chainId)) &&
      p.tokenIds.some((x) => isTokenEqualPair(token, x, api.chainId))
  );
  if (!pool) return null;
  const nativeTokenBalance = await getPairBalance(api, pool.tokenIds[0], pool.owner);
  const tokenBalance = await getPairBalance(api, pool.tokenIds[1], pool.owner);

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

  const chainId = api.chainId;
  const tokenInAssetId = getAssetIdByChain(tokenIn, chainId);
  const tokenOutAssetId = getAssetIdByChain(tokenOut, chainId);

  if (tokenInAssetId === tokenOutAssetId) return plancks;

  const pools = await fetchAssetConvertionPool(api as Api<ChainIdAssetHub>);

  const poolNativeIn = await getPoolReservesByToken(api, nativeToken, tokenIn, pools);
  const poolNativeOut = await getPoolReservesByToken(api, nativeToken, tokenOut, pools);

  const reservesNativeToTokenIn = nativeToken.assetId !== tokenInAssetId ? poolNativeIn : [1n, 1n];
  const reservesNativeToTokenOut = nativeToken.assetId !== tokenOutAssetId ? poolNativeOut : [1n, 1n];

  if (!reservesNativeToTokenIn || !reservesNativeToTokenOut) return undefined;

  if ([...reservesNativeToTokenOut, ...reservesNativeToTokenIn].includes(0n)) return undefined;

  if (nativeToken.assetId !== tokenOutAssetId && !reservesNativeToTokenOut) return undefined;

  const [nativeToTokenOutReserveIn, nativeToTokenOutReserveOut] =
    nativeToken.assetId !== tokenOutAssetId ? reservesNativeToTokenOut : [1n, 1n];

  if (tokenInAssetId === nativeToken.assetId) {
    const stablePlancks = (plancks * nativeToTokenOutReserveOut) / nativeToTokenOutReserveIn;
    return stablePlancks;
  }

  if (!reservesNativeToTokenIn || reservesNativeToTokenIn?.includes(0n)) return undefined;

  const [nativeToTokenInReserveIn, nativeToTokenInReserveOut] = reservesNativeToTokenIn;

  const nativePlancks = (plancks * nativeToTokenInReserveIn) / nativeToTokenInReserveOut;

  const outPlancks = (nativePlancks * nativeToTokenOutReserveOut) / nativeToTokenOutReserveIn;

  return outPlancks;
};
