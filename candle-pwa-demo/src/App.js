import React from 'react';
import { AppBar } from 'material-ui';
import { MuiThemeProvider }  from 'material-ui/styles';
import Connection from './Connection';
import Authentication from './Authentication';
import Candle from './Candle';
import SideMenu from './SideMenu';
import BeaconInfo from './BeaconInfo';
import PWAInfo from './PWAInfo';
import BluetoothInfo from './BluetoothInfo';
import './App.css';

const CANDLE_SERVICE_UUID = 0xFF02;
const CANDLE_COLOR_UUID = 0xFFFC;
const CANDLE_EFFECT_UUID = 0xFFFB;

const decoder = new TextDecoder('utf-8')

const App = React.createClass({
  getInitialState() {
    return {
      connecting: false,
      connected: false,
      authenticated: false,
      candleState : "off",
      color: {r:0,g:0,b:0},
      device: null,
      server: null,
      characteristics: {},
      message: null,
      menuVisible: false,
      view: 'controls'
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
    this.setState({
      connecting: true
    })

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
          connecting: false,
          connected: true,
          color: {r,g,b},
          candleState
        })
        document.documentElement.style.setProperty('--candle-color', `rgb(${r},${g},${b})`)
        this.state.device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected)
      })
      .catch(error => {
        this.setState({
          connecting: false
        })
        console.error('There was an error!', error)
      })
  },
  handleDisconnect() {
    this.state.device.gatt.disconnect()
    this.setState({
      menuVisible: false,
      connected: false
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
  handleOpenMenu() {
    this.setState({
      menuVisible: !this.state.menuVisible
    })
  },
  handleViewChange(view) {
    this.setState({
      view,
      menuVisible: false
    })
  },
  render() {
    let content
    if (this.state.view === 'controls') {
      if (this.state.authenticated && this.state.connected) {
        content = <Candle toggleCandle={this.toggleCandle} handleColorChange={this.handleColorChange} color={this.state.color} />
      } else if (this.state.connected) {
        content = <Authentication handleAuthentication={this.handleAuthentication} />
      } else {
        content = <Connection message={this.state.message} connecting={this.state.connecting} handleConnection={this.handleConnection} />
      }
    } else if (this.state.view === 'beacon') {
      content = <BeaconInfo />
    } else if (this.state.view === 'pwa') {
      content = <PWAInfo />
    } else if(this.state.view === 'bluetooth') {
      content = <BluetoothInfo />
    } else {
      content = <div>Not Found</div>
    }

    return (
      <MuiThemeProvider>
        <div className="App">
          <SideMenu
            menuVisible={this.state.menuVisible}
            onRequestChange={(open) => this.setState({menuVisible: open})}
            handleControls={() => this.handleViewChange('controls')}
            handleBeacon={() => this.handleViewChange('beacon')}
            handlePWA={() => this.handleViewChange('pwa')}
            handleBluetooth={() => this.handleViewChange('bluetooth')}
            connected={this.state.connected}
            handleDisconnect={this.handleDisconnect}
          />

          <AppBar title='Web BLE - Candle Demo'  titleStyle={{fontSize: '20px'}} onLeftIconButtonTouchTap={this.handleOpenMenu} />

          {content}
        </div>
      </MuiThemeProvider>
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
