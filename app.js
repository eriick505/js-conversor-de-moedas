const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

const state = (() => {
  let exchangeRate = {}

  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if(newExchangeRate.conversion_rates) {
        exchangeRate = newExchangeRate;
        return exchangeRate;
      }
    }
  }
})()

const apiKey = 'your_key_here'

const getUrl = currency => `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`

const getErrorMessage = errorType => ({
  "unsupported-code": 'A moeda não existe em nosso banco de dados.',
  "base-code-only-on-pro": "As informações de moedas que não sejam USD ou EUR só podem ser acessadas a partir da base free.exchangerate-api.com",
  "malformed-request": "O Endpoint da sua requisição precisa seguir a estrutura à seguir https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD",
  "invalid-key": 'A chave da sua API não é válida.',
  "quota-reached": 'Sua conta alcançou o limite de requisição permitido em seu plano atual.',
  "not-available-on-plan": 'Seu plano atual não permite este tipo de requisição.'
})[errorType] || 'Não foi possível obter as informações.'

const showErrorMessage = err => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.textContent = err.message
  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
  div.setAttribute('role', 'alert')
  button.classList.add('btn-close')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'close')

  const removeDiv = () => div.remove()

  button.addEventListener('click', removeDiv)

  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}

const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url)

    if(!response.ok) {
      throw new Error('Sua conexão falhou. Não foi possível obter as informações.')
    }

    const exchangeRateData = await response.json()

    if(exchangeRateData.result === 'error') {
      throw new Error(getErrorMessage(exchangeRateData['error-type']))
    }

    return exchangeRateData;
  } catch (err) {
    showErrorMessage(err)
  }
}

const updateCurrencyValues = ({ conversion_rates }) => {
  const currencyTwoElValue = conversion_rates[currencyTwoEl.value]

  convertedValueEl.textContent = (timesCurrencyOneEl.value * currencyTwoElValue).toFixed(2)
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * currencyTwoElValue} ${currencyTwoEl.value}`
}

const init = async () => {
  const url = getUrl('USD')
  const exchangeRateData = await fetchExchangeRate(url)
  const { conversion_rates } = state.setExchangeRate({ ...exchangeRateData })

  if(conversion_rates) {
    const getOptions = selectedCurrency => Object.keys(conversion_rates)
      .map(currency => `
        <option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>
      `)
      .join('')
    
    currencyOneEl.innerHTML = getOptions('USD')
    currencyTwoEl.innerHTML = getOptions('BRL')
  
    updateCurrencyValues({ conversion_rates })
  }
}

const handleWithCurrencyOneEl = async () => {
  const url = getUrl(currencyOneEl.value)
  const exchangeRateData = await fetchExchangeRate(url)
  const exchangeRate = state.setExchangeRate({ ...exchangeRateData })

  updateCurrencyValues(exchangeRate)
}

const handleWithCurrencyTwoEl = () => {
  const exchangeRate = state.getExchangeRate()
  updateCurrencyValues(exchangeRate)
}

const handleWithTimesCurrencyOneEl = () => {
  const exchangeRateTwoElValue = state.getExchangeRate().conversion_rates[currencyTwoEl.value]
  convertedValueEl.textContent = (timesCurrencyOneEl.value * exchangeRateTwoElValue).toFixed(2)
}

currencyOneEl.addEventListener('input', handleWithCurrencyOneEl)
currencyTwoEl.addEventListener('input', handleWithCurrencyTwoEl)
timesCurrencyOneEl.addEventListener('input', handleWithTimesCurrencyOneEl)

init()
