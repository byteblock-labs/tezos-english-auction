# tezos-english-auction
This is actual code deployed with ByteBlock to support auction. It is english auction. 
## Steps to use auction feature
User can connect their tezos supported wallet to https://byteblock.art/. After connecting if user has NFT on their account then it will show under "Collection" tab. click on NFT and user will have two option. 1- Fixed price sell 2- English auction. If you want to put your NFT on auction then choose english auction. Complete blockchain transaction. Your NFT will be shown on byteblock front page.
## Entry points
KT1QX2BKn9tDk2XAQAGzRemcWjF3q5yNPH8Y is auction smart contract. You can explore at https://tzkt.io/KT1QX2BKn9tDk2XAQAGzRemcWjF3q5yNPH8Y/operations/. 
confirm_admin
pause
set_admin
bid 
cancle
resolve
update_allowed
configure
are the different entrypoints. You can consider these as exposed functions. 
Configure: Is the entry point to configure auction. In programming provide different parameters such as price, percentage, min raise, extend time etc..
bid : Use auction ID and bid price to call this entry point. 
Resolve : This is final set of activity done by the artist or final bidder. At the end it will tranfer the NFT to final bidder. 
Cancel: This to cancel the auction. Use auction id to use it.

### reachout to connect@byteblock.io for any query. 
