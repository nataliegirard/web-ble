import React from "react";
import { BlockPicker } from "react-color";
import candle from "../public/candle-transparent.png";
import HeartRateSelector from "./HeartRateSelector";
import { colors } from "./Colors";

const Connection = React.createClass({
  render() {
    return (
      <div className="App-container">
        <p className="App-instructions">
          Tap on candle to turn on. Change color using control below.
        </p>
        <p className="App-candle">
          <img
            className="App-candle-image"
            src={candle}
            alt="Candle"
            onClick={this.props.toggleCandle}
          />
        </p>
        <div className="App-color">
          <BlockPicker
            width="85%"
            color={this.props.color}
            colors={colors}
            onChange={this.props.handleColorChange}
          />
          <HeartRateSelector
            text="Use Heart Rate"
            handleColorChange={this.props.handleColorChange}
          />
        </div>
      </div>
    );
  }
});

export default Connection;
