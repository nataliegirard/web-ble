export default class BatteryService {
	constructor() {
		this.device = null,
		this.server = null,
		this.characteristics = new Map()
	}

	connect() {
		return navigator.bluetooth.requestDevice({
			filters: [{ services: ['heart_rate'] }]
		})
		.then(device => {
			this.device = device
			return device.gatt.connect()
		})
		.then(server => {
			this.server = server
			return server.getPrimaryService('heart_rate')
		})
		.then(service => {
			return Promise.all([
				this.cacheCharacteristic(service, 'body_sensor_location'),
				this.cacheCharacteristic(service, 'heart_rate_measurement')
			])
		})
	}

	disconnect() {
		this.device.gatt.disconnect()
	}

	cacheCharacteristic(service, characteristicUuid) {
		return service.getCharacteristic(characteristicUuid)
			.then(characteristic => {
				this.characteristics.set(characteristicUuid, characteristic)
			})
	}

	startHeartRateNotifications() {
		const char = this.characteristics.get('heart_rate_measurement')
		return char.startNotifications()
			.then(() => char)
	}

	stopHeartRateNotifications() {
		const char = this.characteristics.get('heart_rate_measurement')
		return char.stopNotifications()
			.then(() => char)
	}

	parseHeartRate(value) {
		return value.getUint8(1)
	}
}
