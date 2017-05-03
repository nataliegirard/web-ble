import HeartRateService from './heartRateService'

const heartRate = new HeartRateService()
const connectButton = document.querySelector('#connect')
const errorMessage = document.querySelector('#errorMessage')
const heartRateEl = document.querySelector('#heartRate')
let connected = false

connectButton.addEventListener('click', () => {
	if (connected) {
		heartRate.disconnect()
		connected = false
		connectButton.textContent = 'Connect'
		heartRateEl.textContent = ''
	} else {
		connectButton.textContent = 'Connecting...'
	  heartRate.connect()
	  	.then(() => {
	  		connected = true
	  		errorMessage.textContent = ''
	  		connectButton.textContent = 'Disconnect'
	  		return heartRate.startHeartRateNotifications().then(handleHeartRateNotifications)
	  	})
	  	.catch(error => {
	  		errorMessage.textContent = error
	  		connectButton.textContent = 'Connect'
	  	})
	}
})

const handleHeartRateNotifications = (heartRateMeasurement) => {
	heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
		const heartRateValue = heartRate.parseHeartRate(event.target.value)
		heartRateEl.textContent = heartRateValue
	})
}
