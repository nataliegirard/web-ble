import React from 'react';
import Connection from './Connection';
import Authentication from './Authentication';
import Candle from './Candle';
import './App.css';

const App = React.createClass({
  getInitialState() {
    return {
      connected: false,
      authenticated: false,
      candleState : "off",
      color: '#FF0000'
    }
  },
  componentWillMount() {
    document.documentElement.style.setProperty('--candle-color', '#000000')
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
    this.setState({
      candleState: 'on',
      color: color.hex
    })
    document.documentElement.style.setProperty('--candle-color', color.hex)
  },
  handleConnection() {
    this.setState({
      connected: true
    })
    console.log('connected')
  },
  handleAuthentication(e) {
    console.log('code', e.target.value)
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
  }
})

export default App;
