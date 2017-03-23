import React from 'react';
import { BlockPicker } from 'react-color';
import candle from '../public/candle-transparent.png';

const Connection = React.createClass({
  render() {
    const colors = ['#FF0000', '#E2571E', '#FF7F00', '#FFFF00', '#00FF00', '#96bf33', '#0000FF', '#4B0082', '#8B00FF']
    return (
      <div className="App-container">
        <p className="App-intro">
          Tap on candle to turn on. Change color using control below.
        </p>
        <p className="App-candle">
          <img className="App-candle-image" src={candle} alt="Candle" onClick={this.props.toggleCandle} />
        </p>
        <div className="App-color">
          <BlockPicker width="80%" color={this.props.color} colors={colors} onChange={this.props.handleColorChange} />
        </div>
      </div>
    );
  }
})

export default Connection;

