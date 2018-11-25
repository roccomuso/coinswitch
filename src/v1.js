
const HOST = 'https://api.coinswitch.co'
const VERSION = 'v1'
const BASE = `${HOST}/${VERSION}`

module.exports = {
  VERSION: () => VERSION,
  FORMAT_RES: formatResponse,
  COINS: () => `${BASE}/coins`,
  DESTINATION_COINS: (coin) => `${BASE}/coins/${coin}/destination-coins`,
  DEPOSIT_COINS: (coin) => `${BASE}/coins/${coin}/deposit-coins`,
  LIMIT: () => `${BASE}/limit`,
  OFFER: () => `${BASE}/offer`,
  ORDER: () => `${BASE}/order`,
  GET_ORDER: (id) => `${BASE}/order/${id}`
}

function formatResponse (response) {
  if (!response.success) {
    const error = new Error(response.error || response.msg)
    error.code = response.code
    throw error
  }
  return response.data
}
