import { Buffer } from 'buffer';
import * as t from 'io-ts';
import { SystemWithToolkit, SystemWithWallet } from '../../system';
import * as D from '../decoders';
import { TzKt } from '../../service/tzkt';
import _ from 'lodash';
import {getBigMapUpdates} from '../reducers/queries';
import { getOwnedTokenMetadataBigMapCustom } from '../actionCustom';

export type AuctionNftLoadingData = {
    loaded: boolean;
    error?: string;
    token: null | D.Nft;
    tokenAuction: any;
    tokenMetadata: undefined | string;
  };

export async function getAuctionNfts(
    system: SystemWithToolkit | SystemWithWallet,
    address: string,
    reverse: number
  ): Promise<AuctionNftLoadingData[]> {
    // console.log("entered getAuctionNfts");
    const tokenAuction = await getAuctionsBigMapData(system.tzkt, address);
    // console.log(tokenAuction);
    const activeAuctions = tokenAuction.filter((v: any) => v.active && v.value.asset.length>0);

    var addresses = _.uniq(
      activeAuctions.map((s:any) => s.value.asset[0].fa2_address)
    );

    // console.log(activeAuctions, addresses);
  
    const uniqueAddresses = Array.from(new Set(addresses));

    if (uniqueAddresses.length === 0) {
      return [];
    }
  
    // managing HEN - having higher number of tokens ( 1 lakh+ in this case )
    // TODO : make the logic generic for all collections
    const HENindex = addresses.indexOf("KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton");
    if(HENindex>-1){
      addresses.splice(HENindex,1);
    }
  
    const tokenBigMapRows1 = await getBigMapUpdates(
      system.tzkt,
      {
        path: 'token_metadata',
        action: 'add_key',
        'contract.in': addresses.join(','),
        limit: '10000'
      },
      {
        key: t.string,
        value: t.type({
          token_id: t.string,
          token_info: t.record(t.string, t.string)
        })
      }
    );
  
    const tokenBigMapRows2 = await getBigMapUpdates(
      system.tzkt,
      {
        path: 'assets.token_metadata',
        action: 'add_key',
        'contract.in': addresses.join(','),
        limit: '10000'
      },
      {
        key: t.string,
        value: t.type({
          token_id: t.string,
          token_info: t.record(t.string, t.string)
        })
      }
    );
  
    const tokenBigMapRows = [...tokenBigMapRows1, ...tokenBigMapRows2];
  
    // Sort descending (newest first)
    let salesToView = [...activeAuctions];
    // rev = 1 means newest first
    if(Number(reverse) === 1)
      salesToView = [...activeAuctions].reverse();
    // rev = 2 means oldest first
    else if(Number(reverse) === 2)
      salesToView = [...activeAuctions];
    // rev = 3 means low to high price
    else if(Number(reverse) === 3){
      salesToView = [...activeAuctions].sort((a,b)=>{
        return Number(a.value.current_bid) - Number(b.value.current_bid);
      })
    }
    // rev = 4 means high to low price
    else{
      salesToView = [...activeAuctions].sort((a,b)=>{
        return - Number(a.value.current_bid) + Number(b.value.current_bid);
      })
    }
  
    // //console.log("salesToview", salesToView);
  
    const auctionWithTokenMetadata = salesToView
      .map(x => ({
        tokenAuction: x,
        tokenItem: tokenBigMapRows.find(
          item =>
            x.value.asset.fa2_address === item.contract.address &&
            x.value.asset[0].fa2_batch[0].token_id ===
              item.content.value.token_id + ''
        )
      }))
      .map(x => ({
        loaded: false,
        token: null,
        tokenAuction: x.tokenAuction,
        tokenMetadata: x.tokenItem?.content?.value?.token_info['']
      }));
  
    console.log("salesToken", auctionWithTokenMetadata);
  
    return auctionWithTokenMetadata;
  }

  function fromHexString(input: string) {
    if (/^([A-Fa-f0-9]{2})*$/.test(input)) {
      return Buffer.from(input, 'hex').toString();
    }
    return input;
  }

  export const loadAuctionNft = async (
    system: SystemWithToolkit | SystemWithWallet,
    tokenLoadData: AuctionNftLoadingData
  ): Promise<any> => {
    var { token, loaded, tokenAuction, tokenMetadata } = tokenLoadData;
    const result: any = { ...tokenLoadData };
  
    if (token || loaded) {
      return result;
    }
    result.loaded = true;
  
    try {
      const {
        token_id: tokenIdStr
      } = tokenAuction.value.asset[0].fa2_batch[0];
      const auctionAddress = tokenAuction.value.asset[0].fa2_address;
  
      const tokenId = parseInt(tokenIdStr, 10);
      const mutez = Number.parseInt(tokenAuction.value.current_bid, 10);
      const auction = {
        id: tokenAuction.key,
        asset: tokenAuction.value.asset,
        seller: tokenAuction.value.seller,
        end_time: tokenAuction.value.end_time,
        min_raise: tokenAuction.value.min_raise,
        round_time: tokenAuction.value.round_time,
        start_time: tokenAuction.value.start_time,
        current_bid: mutez,
        extend_time: tokenAuction.value.extend_time,
        last_bid_time: tokenAuction.value.last_bid_time,
        highest_bidder: tokenAuction.value.highest_bidder,
        min_raise_percent: tokenAuction.value.min_raise_percent
      }
  
      if (!tokenMetadata) {
        try{
          const metadata = await getOwnedTokenMetadataBigMapCustom(system.tzkt, auctionAddress, [tokenId.toString()]);
          tokenMetadata = metadata[0].value.token_info[""];
          result.tokenMetadata = tokenMetadata;
          if(tokenMetadata === undefined)
            throw Error("Token metadata not found");
        }
        catch(e){
          result.error = "Couldn't retrieve tokenMetadata";
          console.error("Couldn't retrieve tokenMetadata", { tokenAuction });
          return result;
        }
      }
  
      const { metadata } = (await system.resolveMetadata(
        fromHexString(tokenMetadata),
        auctionAddress
      )) as any;
  
      result.token = {
        address: auctionAddress,
        id: tokenId,
        title: metadata.name || '',
        owner: auction.seller,
        description: metadata.description || '',
        artifactUri: metadata.artifactUri || '',
        metadata: metadata,
        auction : auction,
      };
  
      return result;
    } catch (err) {
      result.error = "Couldn't load token";
      console.error("Couldn't load token", { tokenAuction, err });
      return result;
    }
  };
  

  async function getAuctionsBigMapData(
    tzkt: TzKt,
    address: string
  ): Promise<any> {
    // as no metadata is present in the auction, we need to fetch the keys using the bigMapId or name
    const auctions = await tzkt.getContractBigMapKeys(address, "auctions")
    return auctions;
  }