import React from 'react';
import Connection from './Connection';
import Authentication from './Authentication';
import Candle from './Candle';
import './App.css';

const CANDLE_SERVICE_UUID = 0xFF02;
const CANDLE_COLOR_UUID = 0xFFFC;
const CANDLE_EFFECT_UUID = 0xFFFB;

const decoder = new TextDecoder('utf-8')

const App = React.createClass({
  getInitialState() {
    return {
      connected: false,
      authenticated: false,
      candleState : "off",
      color: {r:0,g:0,b:0},
      device: null,
      server: null,
      characteristics: {},
      message: null
    }
  },
  componentWillMount() {
    if (navigator.bluetooth === undefined) {
      console.error('No navigator.bluetooth found.')
    }
    screen.orientation.lock('portrait').catch(e => e)
  },
  request() {
    let options = {
      filters: [ {services: [ CANDLE_SERVICE_UUID ]} ]
    }
    return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.setState({
          device
        })
      })
  },
  connect() {
    if (!this.state.device) {
      return Promise.reject('Device is not connected.')
    }
    return this.state.device.gatt.connect()
      .then(server => {
        this.setState({
          server
        })
        return Promise.all([
          server.getPrimaryService(CANDLE_SERVICE_UUID).then(service => {
            return Promise.all([
              this.cacheCharacteristic(service, CANDLE_COLOR_UUID),
              this.cacheCharacteristic(service, CANDLE_EFFECT_UUID)
            ])
          })
        ])
      })
  },
  onDeviceDisconnected() {
    console.log('device disconnected')
    this.setState({
      connected: false,
      message: 'You have been disconnected from the device. Please reconnect.'
    })
  },
  getCandleColor() {
    return this.readCharacteristicValue(CANDLE_COLOR_UUID)
      .then(this.decodeString)
  },
  setColor(rgb) {
    const {r,g,b} = rgb

    return Promise.resolve()
      .then(_ => {
        const data = [0x00, r, g, b, 0x04, 0x00, 0x01, 0x00]
        this.writeCharacteristicValue(CANDLE_EFFECT_UUID, new Uint8Array(data))
      })
  },
  toggleCandle(e) {
    let color = this.state.color

    if (this.state.candleState === 'off') {
      const {r,g,b} = color

      if (r===0 && g===0 && b===0) {
        color = {r:255,g:255,b:255}
      }

      this.setState({
        candleState: "on",
        color: color
      })
    } else {
      this.setState({
        candleState: "off"
      })
      color = {r:0,g:0,b:0}
    }
    this.setColor(color)
    const {r,g,b} = color
    document.documentElement.style.setProperty('--candle-color', `rgb(${r},${g},${b})`);
  },
  handleColorChange(color) {
    this.setColor(color.rgb).then(col => {
      this.setState({
        candleState: 'on',
        color: color.rgb
      })
      const {r,g,b} = color.rgb
      document.documentElement.style.setProperty('--candle-color', `rgb(${r},${g},${b})`)
    })
  },
  handleConnection() {
    this.request()
      .then(_ => {
        return this.connect()
      })
      .then(_ => {
        this.setState({
          message: null
        })
        return this.readCharacteristicValue(CANDLE_COLOR_UUID)
      })
      .then(data => {
        let r = data.getUint8(1)
        let g = data.getUint8(2)
        let b = data.getUint8(3)

        let candleState = true
        if (r===0 && b===0 && b===0) {
          candleState = false
        }

        if (!r) {
          console.log('there is no set color')
          r = 255
          g = 255
          b = 255
        }

        this.setState({
          connected: true,
          color: {r,g,b},
          candleState
        })
        document.documentElement.style.setProperty('--candle-color', `rgb(${r},${g},${b})`)
        this.state.device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected)
      })
      .catch(error => {
        console.error('There was an error!', error)
      })
  },
  handleAuthentication(e) {
    const code = e.target.value
    if (code === '1234') {
      this.setState({
        authenticated: true
      })
    }
  },
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Web BLE - Candle Demo</h2>
        </div>
        {this.state.authenticated && this.state.connected ? (
          <Candle toggleCandle={this.toggleCandle} handleColorChange={this.handleColorChange} color={this.state.color} />
        ) : this.state.connected ? (
          <Authentication handleAuthentication={this.handleAuthentication} />
        ) : (
          <Connection message={this.state.message} handleConnection={this.handleConnection} />
        )}
      </div>
    );
  },
  cacheCharacteristic(service, characteristicUuid) {
    return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        const chars = this.state.characteristics
        chars[characteristicUuid] = characteristic
        this.setState({
          characteristics: chars
        })
      })
  },
  readCharacteristicValue(characteristicUuid) {
    const characteristic = this.state.characteristics[characteristicUuid]
    return characteristic.readValue()
      .then(value => {
        for (var i=0, a=[]; i<value.bytelength; i++) { a.push(value.getUint8(i))}
        console.debug('READ', characteristic.uuid, a, value)
        return value
      })
  },
  writeCharacteristicValue(characteristicUuid, value) {
    const characteristic = this.state.characteristics[characteristicUuid]
    console.debug('WRITE', characteristic.uuid, value)
    return characteristic.writeValue(value)
  },
  decodeString(data) {
    return decoder.decode(data)
  }
})

export default App;
