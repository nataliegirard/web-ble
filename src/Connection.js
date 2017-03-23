import React from 'react';

const Connection = React.createClass({
  render() {
    return (
      <div className="App-container">
        <p className="App-instructions">Connect to a PlayBulb Candle</p>
        <button className="App-connect-button" onClick={this.props.handleConnection}>Connect</button>
      </div>
    );
  }
})

export default Connection;
