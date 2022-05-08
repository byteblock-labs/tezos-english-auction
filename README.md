# tezos-english-auction
This is actual code deployed with ByteBlock to support auction. It is english auction. 

## Steps to deploy the contract on testnet 
-> Go to https://smartpy.io/michelson and paste the auction_contract.mligo file .\
![image](https://user-images.githubusercontent.com/62099471/167284353-a70a23d6-089b-436f-ac93-5dac4b0311e4.png)
<br>
<br>
-> Deploy the contract on testnet using the option shown above .\
-> Your testnet contract will be ready to use \
-> Use the entrypoints in your code and perform transactions as per your requirement .\

## Steps to fork our testnet contract on mainnet
-> We will use our testnet contract for this .\
-> Go to https://better-call.dev/ .\
-> Search your testnet contract .\
-> Use the fork option . eg. https://better-call.dev/hangzhou2net/KT1LWwLzyxy3BvkEqNr2Lfe5xvk7geyNnZQt/fork \
-> Fill in the parameter values for storage that you want to change for your mainnet contract .\
![image](https://user-images.githubusercontent.com/62099471/167284593-f66fbe73-53d6-4c4e-a927-4e6d29ec6429.png)\
<br>
-> Deploy it using your temple wallet .\
-> Use the contract address and its entrpoints in your existing code .\

## Steps to interact with the contract
-> Once your contract is deployed , go to https://better-call.dev/ and search the contract using the contract address .\
-> Use the interact option . eg . https://better-call.dev/hangzhou2net/KT1LWwLzyxy3BvkEqNr2Lfe5xvk7geyNnZQt/interact \
![image](https://user-images.githubusercontent.com/62099471/167284472-27b7993a-0e94-40f1-90a8-41412b28779c.png) \
-> Choose the entrypoint you want to use and perform transactions via interface . \

## Steps to use auction feature
User can connect their tezos supported wallet to https://byteblock.art/. After connecting if user has NFT on their account then it will show under "Collection" tab. click on NFT and user will have two option. 1- Fixed price sell 2- English auction. If you want to put your NFT on auction then choose english auction. Complete blockchain transaction. Your NFT will be shown on byteblock front page.
## Entry points
KT1QX2BKn9tDk2XAQAGzRemcWjF3q5yNPH8Y is auction smart contract. You can explore at https://tzkt.io/KT1QX2BKn9tDk2XAQAGzRemcWjF3q5yNPH8Y/operations/. 
#### confirm_admin
#### pause
#### set_admin
#### bid 
#### cancle
#### resolve
#### update_allowed
#### configure
are the different entrypoints. You can consider these as exposed functions. 
Configure: Is the entry point to configure auction. In programming provide different parameters such as price, percentage, min raise, extend time etc..
bid : Use auction ID and bid price to call this entry point. 
Resolve : This is final set of activity done by the artist or final bidder. At the end it will tranfer the NFT to final bidder. 
Cancel: This to cancel the auction. Use auction id to use it.

### reachout to connect@byteblock.io for any query. 
