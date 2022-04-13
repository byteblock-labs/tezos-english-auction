import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '../../index';

import {
  getAuctionNfts, loadAuctionNft,
} from '../lib/queries';

import { ErrorKind, RejectValue } from '../errors';
import { AuctionNftLoadingData } from '../../../lib/nfts/Auction/queries';


type Opts = { state: State; rejectValue: RejectValue };

export const loadMoreAuctionNftsQuery = createAsyncThunk<
  { tokens: AuctionNftLoadingData[] },
  {page: number},
  Opts
>(
  'query/loadMoreAuctionNftsQuery',
  async (args, { getState, rejectWithValue }) => {
    const { system, auction } = getState();
    try {
      const tokens = auction.auction.tokens ?? [];

      // Load 16 more (at least 2 rows)
      const iStart = (args.page-1)*16;
      const iEnd = iStart + 16;

      // Need to rebuild the array
      const tokensAfter = await Promise.all(
        tokens.map(async (x, i) =>
          i >= iStart && i < iEnd ? await loadAuctionNft(system, x) : x
        )
      );

      return { tokens: tokensAfter };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetMarketplaceNftsFailed,
        message: `Failed to load marketplace nfts`
      });
    }
  }
);

export const getAuctionNftsQuery = createAsyncThunk<
  { tokens: AuctionNftLoadingData[] },
  {address:  string
     , reverse: number
  },
  Opts
>(
  'query/getAuctionNfts',
  async (args, { getState, rejectWithValue }) => {
    const { system } = getState();
    console.log("entered");
    try {
      let tokens;
      console.log(args);
      tokens = await getAuctionNfts(system, args.address
        , args.reverse
        );

      // console.log(tokens);
      // Load 17 initially (1-feature + at least 2 rows)
      for (const i in tokens.slice(0, 16)) {
        tokens[i] = await loadAuctionNft(system, tokens[i]);
      }
      console.log(tokens);
      return { tokens };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetMarketplaceNftsFailed,
        message: `Failed to retrieve auctions nfts from: ${args.address}`
      });
    }
  }
);


export const refreshAuctionNftsQuery = createAsyncThunk<
  { tokens: AuctionNftLoadingData[] },
  undefined,
  Opts
>(
  'query/refreshMarketplaceNfts',
  async (_, { getState, rejectWithValue }) => {
    try {
      let tokens: AuctionNftLoadingData[]  = [];

      return { tokens };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetMarketplaceNftsFailed,
        message: `Error occured ! Please reload the page .`
      });
    }
  }
);