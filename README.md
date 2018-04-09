# ERC-20-Token-Wallet
A template ERC-20 token wallet. Runs fully client-side using MetaMask and can store any ERC-20 token with just the contract address.

## How can I use this template?
You can make whatever changes you want to the HTML and CSS, but most of the "meat" is in /js/index.js. The only piece of information you need in order to get this wallet up and running with any ERC-20 token is the contract address. The contract address is the token's address on the Ethereum blockchain, and the ABI is a collection of information, including available functions, for interacting with an ERC-20 token.

The contract address goes right into the top as a string. `const CONTRACT_STRING = /* INSERT contract address for token */;`

If you need to find the contract address, just go to [Etherscan](https://etherscan.io/) and look up your token in the top right search bar.

## Why MetaMask?
[MetaMask](https://metamask.io/) is a really great, easy-to-use, secure plugin for most modern browsers (Chrome, Firefox, Opera, etc.) that allows the browser to communicate with the Ethereum blockchain. Using MetaMask means you don't have to worry about security or compatibility, because pretty much everything difficult is handled smoothly and easily by the MetaMask plugin.

[Working Product](https://www.lockepocket.com/)
