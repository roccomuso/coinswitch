const test = require('tape')
const Coinswitch = require('../')

const API_KEY = 'cRbHFJTlL6aSfZ0K2q7nj6MgV5Ih4hbA2fUG0ueO' // testing key (will use mocked data)
const SANDBOX_ORDER_ID = {
  no_deposit: '22222222-6c9e-4c53-9a6d-55e089aebd04',
  confirming: '33333333-6c9e-4c53-9a6d-55e089aebd04',
  exchanging: '44444444-6c9e-4c53-9a6d-55e089aebd04',
  sending: '55555555-6c9e-4c53-9a6d-55e089aebd04',
  complete: '66666666-6c9e-4c53-9a6d-55e089aebd04',
  failed: '77777777-6c9e-4c53-9a6d-55e089aebd04',
  refunded: '88888888-6c9e-4c53-9a6d-55e089aebd04',
  timeout: '11111111-6c9e-4c53-9a6d-55e089aebd04'
}

const cs = new Coinswitch({
  apiKey: API_KEY,
  userIP: '1.1.1.1'
})

test('Coinswitch is istantiable Class', (t) => {
  t.plan(1)
  t.ok(cs instanceof Coinswitch, 'Coinswitch is a Class')
})

test('Coinswitch "apiKey" is required', (t) => {
  t.plan(1)
  try {
    new Coinswitch().getCoins()
  } catch (e) {
    t.equal(e.message, 'apiKey is required.', 'apiKey is required')
  }
})

test('Coinswitch "userIP" is required', (t) => {
  t.plan(1)
  try {
    new Coinswitch({
      apiKey: API_KEY
    }).getCoins()
  } catch (e) {
    t.equal(e.message, 'userIP is required.', 'userIP is required')
  }
})

test('.getCoins() returns supported coins list', (t) => {
  t.plan(4)
  cs.getCoins().then(list => {
    t.ok(list.length, 'coins list length !== 0')
    const coin = list[0]
    coinHasValidProps(coin, t)
  })
})

test('.isCoinActive(<symbol>): symbol is required', (t) => {
  t.plan(1)
  cs.isCoinActive().then(t.fail).catch(e => {
    t.equal(e.message, 'symbol string is required', 'symbol is required')
  })
})

test('.isCoinActive(<symbol>) returns true for supported coin', (t) => {
  t.plan(2)
  cs.isCoinActive('BTC').then(btc => t.ok(btc, 'btc supported')) // case insensitive
  cs.isCoinActive('ltc').then(ltc => t.ok(ltc, 'ltc supported'))
})

test('.isCoinActive(<symbol>) reject for unknown coin symbol', (t) => {
  t.plan(1)
  cs.isCoinActive('unknown').then(t.fail).catch(err => t.equal(err.code, 'invalid_symbol', 'coin unsupported'))
})

test('.getDestinationCoins(<symbol>): symbol is required', (t) => {
  t.plan(1)
  cs.getDestinationCoins().then(t.fail).catch(e => {
    t.equal(e.message, 'symbol string is required', 'symbol is required')
  })
})

test('.getDestinationCoins(<symbol>) returns list of coins', (t) => {
  t.plan(4)
  cs.getDestinationCoins('btc').then(list => {
    t.ok(list.length, 'coins list length !== 0')
    const coin = list[0]
    coinHasValidProps(coin, t)
  })
})

test('.getDestinationCoins(<symbol>): reject for unknown coin symbol', (t) => {
  t.plan(1)
  cs.getDestinationCoins('unknown').then(t.fail).catch(err => t.equal(err.code, 'invalid_symbol', 'coin unsupported'))
})

test('.getDepositCoins(<symbol>): symbol is required', (t) => {
  t.plan(1)
  cs.getDepositCoins().then(t.fail).catch(e => {
    t.equal(e.message, 'symbol string is required', 'symbol is required')
  })
})

test('.getDepositCoins(<symbol>) returns list of coins', (t) => {
  t.plan(4)
  cs.getDepositCoins('btc').then(list => {
    t.ok(list.length, 'coins list length !== 0')
    const coin = list[0]
    coinHasValidProps(coin, t)
  })
})

test('.getDepositCoins(<symbol>): reject for unknown coin symbol', (t) => {
  t.plan(1)
  cs.getDepositCoins('unknown').then(t.fail).catch(err => t.equal(err.code, 'invalid_symbol', 'coin unsupported'))
})

test('.getExchangeLimit(<symbol>, <symbol>): required arguments', (t) => {
  t.plan(2)
  cs.getExchangeLimit().then(t.fail).catch(e => {
    t.equal(e.message, 'depositCoin string is required', 'depositCoin is required')
  })
  cs.getExchangeLimit('btc').then(t.fail).catch(e => {
    t.equal(e.message, 'destinationCoin string is required', 'destinationCoin is required')
  })
})

test('.getExchangeLimit(..) returns min max deposit', async (t) => {
  t.plan(4)
  const { depositCoin, destinationCoin, depositCoinMinAmount, depositCoinMaxAmount } = await cs.getExchangeLimit('btc', 'ltc')

  t.equal(depositCoin, 'btc', 'depositCoin match')
  t.equal(destinationCoin, 'ltc', 'destinationCoin match')
  t.equal(typeof depositCoinMinAmount, 'number', 'depositCoinMinAmount is a number')
  t.equal(typeof depositCoinMaxAmount, 'number', 'depositCoinMaxAmount is a number')
})

test('.getExchangeLimit(..) throws with unknown symbol', (t) => {
  t.plan(1)
  cs.getExchangeLimit('btc', 'unknown').then(t.fail).catch((err) => {
    t.equal(err.message, 'Invalid symbol for depositCoin or destinationCoin', 'invalid symbol error')
  })
})

test('.generateOffer(<symbol>, <symbol>, <amount>): required arguments', (t) => {
  t.plan(3)
  cs.generateOffer().then(t.fail).catch(e => {
    t.equal(e.message, 'depositCoin string is required', 'depositCoin is required')
  })
  cs.generateOffer('btc').then(t.fail).catch(e => {
    t.equal(e.message, 'destinationCoin string is required', 'destinationCoin is required')
  })
  cs.generateOffer('btc', 'eth').then(t.fail).catch(e => {
    t.equal(e.message, 'depositCoinAmount number is required', 'depositCoinAmount is required')
  })
})

test('.generateOffer(..) throws with unknown symbol', (t) => {
  t.plan(1)
  cs.generateOffer('btc', 'unknown', 0.1).then(t.fail).catch((err) => {
    t.equal(err.message, 'Invalid symbol for depositCoin or destinationCoin', 'invalid symbol error')
  })
})

test('.generateOffer(..) get an Exchange offer', async (t) => {
  t.plan(5)
  const { depositCoin, destinationCoin, depositCoinAmount, destinationCoinAmount, offerReferenceId } = await cs.generateOffer('btc', 'eth', 0.1)

  t.equal(depositCoin, 'btc', 'depositCoin match')
  t.equal(destinationCoin, 'eth', 'destinationCoin match')
  t.equal(typeof depositCoinAmount, 'number', 'depositCoinAmount is a number')
  t.equal(typeof destinationCoinAmount, 'number', 'destinationCoinAmount is a number')
  t.equal(typeof offerReferenceId, 'string', 'offerReferenceId generated')
})

test('.generateOffer(..) depositAmount must be inside the limit specified by limits API', (t) => {
  t.plan(1)
  cs.generateOffer('btc', 'eth', 10).then(t.fail).catch((err) => {
    t.ok(err.message.match('depositCoinAmount is greater than supported max limit of'), 'limit error match')
  })
})

test('.makeOrder({..}): required obj with arguments', (t) => {
  t.plan(1)
  cs.makeOrder({
    depositCoin: 'btc',
    destinationCoin: 'eth',
    depositCoinAmount: 0.1
  }).then(t.fail).catch(e => {
    t.equal(e.message, 'offerReferenceId is a required string', 'offerReferenceId is required')
  })
})

test('.makeOrder({..}): create an exchange order', async (t) => {
  t.plan(3)
  try {
    const { offerReferenceId } = await cs.generateOffer('btc', 'ltc', 0.03)
    const { orderId, exchangeAddress: { address, tag } } = await cs.makeOrder({
      depositCoin: 'btc',
      destinationCoin: 'ltc',
      depositCoinAmount: 0.03,
      offerReferenceId,
      userReferenceId: 'test-user',
      destinationAddress: { address: 'LXdmzmqSALB1DbJyA43b6prQCXKn1J6SdV' },
      refundAddress: { address: '16iL2ZM4CfeiH3CrtrNjGVgR6ja2p5AFec' }
    })

    t.ok(orderId, `got sandboxed orderId ${orderId}`)
    t.ok(address, 'got exchange address')
    t.equal(tag, null, 'got no tag')
  } catch (e) {
    t.fail(e)
  }
})

test('.getOrder(<orderId>): required argument', (t) => {
  t.plan(1)
  cs.getOrder().then(t.fail).catch((err) => {
    t.equal(err.message, 'orderId string is required', 'orderId is required')
  })
})

test('.getOrder(<orderId>): get expected result for no_deposit', async (t) => {
  t.plan(15)
  const orderId = SANDBOX_ORDER_ID['no_deposit']
  validateByOrderType(await cs.getOrder(orderId), 'no_deposit', t)
})

// utils

function coinHasValidProps (coin, t) {
  const props = ['symbol', 'name', 'isActive']
  props.map(key => t.ok(coin.hasOwnProperty(key), `coin element has "${key}" property`))
}

function validateByOrderType (orderResult, type, t) {
  const {
    orderId,
    exchangeAddress,
    destinationAddress,
    createdAt,
    status,
    inputTransactionHash,
    outputTransactionHash,
    depositCoin,
    destinationCoin,
    depositCoinAmount,
    destinationCoinAmount,
    validTill,
    userReferenceId
  } = orderResult

  t.equal(orderId, SANDBOX_ORDER_ID[type], 'orderId match')
  t.equal(exchangeAddress.address, 'MOCKED-EXCHANGE-DEPOSIT-ADDRESS', 'exchangeAddress match')
  t.equal(exchangeAddress.tag, null, 'expecting no tag')
  t.equal(destinationAddress.address, 'MOCKED-DESTINATION-COIN-ADDRESS', 'orderId match')
  t.equal(destinationAddress.tag, null, 'expecting no tag')
  t.equal(typeof createdAt, 'number', 'got createdAt timestamp')
  t.equal(status, type, 'got expected status')
  t.equal(inputTransactionHash, null, 'got expected inputTransactionHash')
  t.equal(outputTransactionHash, null, 'got expected outputTransactionHash')
  t.equal(depositCoin, 'ltc', 'got expected deposit coin')
  t.equal(destinationCoin, 'btc', 'got expected destination coin')
  t.equal(depositCoinAmount, null, 'got expected depositCoinAmount')
  t.equal(destinationCoinAmount, null, 'got expected destinationCoinAmount')
  t.equal(typeof validTill, 'string', 'got valid till timestamp (string)')
  t.equal(userReferenceId, '1', 'mocked user reference id match')
}
