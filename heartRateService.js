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

	readSensorLocation() {
		const char = this.characteristics.get('body_sensor_location')
		return char.readValue()
			.then(value => {
				let sensorLocation = value.getUint8(0);
				switch (sensorLocation) {
					case 0: return 'Other';
					case 1: return 'Chest';
					case 2: return 'Wrist';
					case 3: return 'Finger';
					case 4: return 'Hand';
					case 5: return 'Ear Lobe';
					case 6: return 'Foot';
					default: return 'Unknown';
				}
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
