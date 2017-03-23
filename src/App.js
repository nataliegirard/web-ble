import React from 'react';
import Connection from './Connection';
import Authentication from './Authentication';
import Candle from './Candle';
import './App.css';

const CANDLE_SERVICE_UUID = 0xFF02;
const CANDLE_COLOR_UUID = 0xFFFC;
const CANDLE_EFFECT_UUID = 0xFFF8;

const decoder = new TextDecoder('utf-8')

const App = React.createClass({
  getInitialState() {
    return {
      connected: false,
      authenticated: false,
      candleState : "off",
      color: '#FF0000',
      device: null,
      server: null,
      characteristics: {}
    }
  },
  componentWillMount() {
    if (navigator.bluetooth === undefined) {
      console.log('No navigator.bluetooth found.')
    }
    screen.orientation.lock('portrait').catch(e => e)
    document.documentElement.style.setProperty('--candle-color', '#000000')
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
  getCandleColor() {
    return this.readCharacteristicValue(CANDLE_COLOR_UUID)
      .then(this.decodeString)
  },
  setColor(rgb) {
    const {r,g,b} = rgb
    console.log('hex to rgb', r,g,b)
    return Promise.resolve()
      .then(_ => {
        const data = [0x00, r, g, b, 0x04, 0x00, 0x01, 0x00]
        this.writeCharacteristicValue(CANDLE_EFFECT_UUID, new Uint8Array(data))
      })
  },
  toggleCandle(e) {
    if (this.state.candleState === 'off') {
      let color = this.state.color
      if (color === '#000000') {
        color = '#FF0000'
      }
      this.setState({
        candleState: "on",
        color: color
      })
      document.documentElement.style.setProperty('--candle-color', color);
    } else {
      this.setState({
        candleState: "off"
      })
      document.documentElement.style.setProperty('--candle-color', '#000000');
    }
  },
  handleColorChange(color) {
    console.log(color)
    this.setColor(color.rgb).then(col => {
      console.log(col)
      this.setState({
        candleState: 'on',
        color: color.hex
      })
      document.documentElement.style.setProperty('--candle-color', color.hex)
    })
  },
  handleConnection() {
    this.request()
      .then(_ => {
        return this.connect()
      })
      .then(_ => {
        const candleColor = this.readCharacteristicValue(CANDLE_COLOR_UUID)
          .then(this.decodeString)
        console.log('connected', candleColor)
        this.setState({
          connected: true
        })
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
        {this.state.authenticated ? (
          <Candle toggleCandle={this.toggleCandle} handleColorChange={this.handleColorChange} color={this.state.color} />
        ) : this.state.connected ? (
          <Authentication handleAuthentication={this.handleAuthentication} />
        ) : (
          <Connection handleConnection={this.handleConnection} />
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
        console.log('READ', characteristic.uuid, a, value)
        return value
      })
  },
  writeCharacteristicValue(characteristicUuid, value) {
    console.log(this.state.characteristics)
    const characteristic = this.state.characteristics[characteristicUuid]
    console.log('WRITE', characteristic.uuid, value)
    return characteristic.writeValue(value)
  },
  decodeString(data) {
    return decoder.decode(data)
  }
})

export default App;
