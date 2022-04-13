import { SystemWithToolkit, SystemWithWallet } from '../../system';

export async function configureAuction(
    system: SystemWithToolkit | SystemWithWallet,
    auctionContract : string,
    opening_price : number,
    min_raise : number,
    min_raise_percent : number,
    asset : any
) {
    const contractA = await system.toolkit.wallet.at(auctionContract);
    const contractT = await system.toolkit.wallet.at(asset[0].fa2_address);
    const token_id = Number(asset[0].fa2_batch[0].token_id);
    
    // starting in 1 minute after processing
    const start_time_ = new Date();
    start_time_.setMinutes(start_time_.getMinutes() + 1);
    const start_time = start_time_.toISOString();

    // 24 hrs auction time
    const end_time_ = new Date(start_time_);
    end_time_.setDate(start_time_.getDate() + 1);
    const end_time = end_time_.toISOString();

    const batch = system.toolkit.wallet
    .batch([])
    .withContractCall(
      contractT.methods.update_operators([
        {
          add_operator: {
            owner: system.tzPublicKey,
            operator: auctionContract,
            token_id: token_id
          }
        }
      ])
    );
    
    batch.withContractCall(
        contractA.methods.configure(
            opening_price,//opening_price ( in mutez ),
            min_raise_percent,//min_raise_percent,
            min_raise,//min_raise ( in mutez ),
            86400,// extend time ( 1 day )
            86400, // round_time ( 1 day )
            asset,
            start_time,
            end_time
        )
    )

    return batch.send();
}

export async function bidAuction(
    system: SystemWithWallet,
    auctionContract : string,
    auctionId : number,
    bidPrice : number // in mutez
){
    const contract = await system.toolkit.wallet.at(auctionContract);
    const bid = contract.methods.bid(auctionId);
    return bid.send({amount: bidPrice});
}

export async function resolveAuction(
    system: SystemWithWallet,
    auctionContract : string,
    auctionId : number,
    royalty: number,
    minter: string,
    sold: Boolean
){
    const contract = await system.toolkit.wallet.at(auctionContract);
    const batch = system.toolkit.wallet
    .batch([])
    .withContractCall(
      contract.methods.resolve(auctionId)
    )

    if(sold){
      batch.withTransfer({ to: minter, amount: royalty });
    }

    return batch.send();
}

export async function cancelAuction(
  system: SystemWithWallet,
  auctionContract : string,
  auctionId : number
){
  const contract = await system.toolkit.wallet.at(auctionContract);
  const cancel = contract.methods.cancel(auctionId);
  return cancel.send();
}
