# coinswitch [![NPM Version](https://img.shields.io/npm/v/coinswitch.svg)](https://www.npmjs.com/package/coinswitch) ![node](https://img.shields.io/node/v/coinswitch.svg) [![Dependency Status](https://david-dm.org/roccomuso/coinswitch.png)](https://david-dm.org/roccomuso/coinswitch) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [<img width="100" align="right" src="https://raw.githubusercontent.com/roccomuso/coinswitch/master/altcoins.png?sanitize=true" alt="bitcoin">](https://github.com/roccomuso/coinswitch)

> Browser and Node.js [Coinswitch.co](https://coinswitch.com) API client

Easily exchange assets with few lines of code.

## Install

    npm install --save coinswitch

## Usage

```javascript
const Coinswitch = require('coinswitch')

;(async () => {

  const cs = new Coinswitch({
    apiKey: '<YOUR API KEY>',
    userIP: '1.1.1.1'
  })

  const coinsList = await cs.getCoins()  
  console.log(coinsList)
  /*
  [
    {
        "symbol": "btc",
        "name": "Bitcoin",
        "isActive": true
    },
    {
        "symbol": "ltc",
        "name": "Litecoin",
        "isActive": true
    },
    {
        "symbol": "bch",
        "name": "Bitcoin Cash",
        "isActive": true
    },
  	...
  ]
  */
})()
```

### Make an exchange order

```javascript
const cs = new Coinswitch({
  apiKey: '<YOUR API KEY>',
  userIP: '1.1.1.1'
})

const {
  offerReferenceId,
  depositCoinAmount,
  destinationCoinAmount
} = await cs.generateOffer('btc', 'ltc', 0.03)

const {
  orderId,
  exchangeAddress: { address }
} = await cs.makeOrder({
  depositCoin: 'btc',
  destinationCoin: 'ltc',
  depositCoinAmount,
  offerReferenceId,
  userReferenceId: 'test-user',
  destinationAddress: { address: 'LXdmzmqSALB1DbJyA43b6prQCXKn1J6SdV' },
  refundAddress: { address: '16iL2ZM4CfeiH3CrtrNjGVgR6ja2p5AFec' }
})

console.log(`
=========
Order ID: ${orderId}
Deposit: BTC (${depositCoinAmount})
Receive: LTC (${destinationCoinAmount})
Exchange Address: ${address}
=========
`)
```

**NB**: Addresses must be specified as a JS Object like `{address: "...", tag: "..."}`

### Methods

**Get your *api-key* from the [coinswitch API page](https://coinswitch.co/site/api)**.

- `new CoinSwitch(<Object>)`: The class constructor requires an Object like `{ apiKey: "...", userIP: "..."}`.

|Method Name|Return|Description|
|:-----|:-----:|-----------|
|`.version()`|`String`|Return API version being used|
|`.getCoins()`|`Array`|Get list of supported coins as obj `{symbol, name, isActive}`|
|`.isCoinActive(<symbol>)`|`Boolean`|Given a symbol (ex. `btc`) return `true`/`false` wether the coin is active or not|
|`.getDestinationCoins(<symbol>)`|`Array`|Return list of available destination coins for the one provided|
|`.getDepositCoins(<symbol>)`|`Array`|Return list of depositable coins for the one provided|
|`.getExchangeLimit(<symbol>, <symbol>)`|`Object`|Get exchange limits for a depositCoin and destinationCoin|
|`.generateOffer(<symbol>, <symbol>, <number>)`|`Object`|Generate an exchange offer for a coin pair|
|`.makeOrder(<object>*)`|`Object`|Creates a new tx for an offer. It will return transaction object with an `order_id` field to track the tx status.|
|`.getOrder(<string>)`|`Object`|Get status of the given Order ID string.|

`*` makeOrder input object sample:

```js
{
  depositCoin: 'btc',
  destinationCoin: 'ltc',
  depositCoinAmount: 0.03,
  offerReferenceId: "...", // get it from generateOffer(..)
  userReferenceId: 'test-user',
  destinationAddress: { address: 'LXdmzmqSALB1DbJyA43b6prQCXKn1J6SdV' },
  refundAddress: { address: '16iL2ZM4CfeiH3CrtrNjGVgR6ja2p5AFec' }
}
```

## Example

For more examples look at the unit `test/` folder.

## Test

> npm test

## Debug

To enable debug set the env var `DEBUG=coinswitch`

# License

MIT
