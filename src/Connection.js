import React from 'react';
import { RaisedButton, CircularProgress } from 'material-ui';

const Connection = React.createClass({
  render() {
    return (
      <div className="App-container">
        <p className="App-message">{this.props.message}</p>
        <p className="App-instructions">Connect to a PlayBulb Candle</p>
        { this.props.connecting ?
          <CircularProgress /> :
          <RaisedButton label="Connect" primary={true} onTouchTap={this.props.handleConnection} />
        }
      </div>
    );
  }
})

export default Connection;
