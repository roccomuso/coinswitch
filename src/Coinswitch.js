const debug = require('debug')('coinswitch')
const crossFetch = require('cross-fetch')
const assert = require('assert')
const v1 = require('./v1')

class Coinswitch {
  constructor ({ apiKey, userIP } = {}) {
    assert(apiKey, 'apiKey is required.')
    assert(userIP, 'userIP is required.')
    this.apiKey = apiKey
    this.userIP = userIP
    this.Api = v1
    debug('Using Coinswitch.io API version:', this.Api.VERSION())
    const headers = {
      'x-api-key': this.apiKey,
      'x-user-ip': this.userIP,
      'Content-Type': 'application/json'
    }

    this.get = (uri, opts) => crossFetch(uri, {
      headers,
      ...opts
    }).then(res => res.json())
      .then(this.Api.FORMAT_RES)
    this.post = (uri, body) => crossFetch(uri, {
      method: 'post',
      headers,
      body: JSON.stringify(body)
    }).then(res => res.json())
      .then(this.Api.FORMAT_RES)

    return this
  }

  version () {
    return this.Api.VERSION
  }

  async getCoins () {
    return this.get(this.Api.COINS())
  }

  async isCoinActive (sym) {
    assert(typeof sym === 'string', 'symbol string is required')
    const coinsList = await this.getCoins()
    sym = sym.toLowerCase()
    const { isActive } = coinsList.find(({ symbol }) => sym === symbol) || {}
    if (typeof isActive === 'undefined') {
      const err = new Error('Invalid symbol')
      err.code = 'invalid_symbol'
      throw err
    }
    return isActive
  }

  async getDestinationCoins (sym) {
    assert(typeof sym === 'string', 'symbol string is required')
    sym = sym.toLowerCase()
    return this.get(this.Api.DESTINATION_COINS(sym))
  }

  async getDepositCoins (sym) {
    assert(typeof sym === 'string', 'symbol string is required')
    sym = sym.toLowerCase()
    return this.get(this.Api.DEPOSIT_COINS(sym))
  }

  async getExchangeLimit (depositCoin, destinationCoin) {
    assert(typeof depositCoin === 'string', 'depositCoin string is required')
    assert(typeof destinationCoin === 'string', 'destinationCoin string is required')
    return this.post(this.Api.LIMIT(), { depositCoin, destinationCoin })
  }

  async generateOffer (depositCoin, destinationCoin, depositCoinAmount) {
    assert(typeof depositCoin === 'string', 'depositCoin string is required')
    assert(typeof destinationCoin === 'string', 'destinationCoin string is required')
    assert(typeof depositCoinAmount === 'number', 'depositCoinAmount number is required')
    return this.post(this.Api.OFFER(), { depositCoin, destinationCoin, depositCoinAmount })
  }

  async makeOrder (opts = {}) {
    validateOrder(opts)
    return this.post(this.Api.ORDER(), opts)
  }

  async getOrder (orderId) {
    assert(typeof orderId === 'string', 'orderId string is required')
    return this.get(this.Api.GET_ORDER(orderId))
  }
}

function validateOrder (opts) {
  const TYPE_MAP = {
    depositCoin: 'string',
    destinationCoin: 'string',
    depositCoinAmount: 'number',
    offerReferenceId: 'string',
    userReferenceId: 'string',
    destinationAddress: 'object',
    refundAddress: 'object'
  }
  for (const [prop, type] of Object.entries(TYPE_MAP)) {
    assert.strictEqual(typeof opts[prop], type, `${prop} is a required ${type}`)
  }
}

module.exports = Coinswitch
