import React from 'react';

const Authentication = React.createClass({
  render() {
    return (
      <div className="App-container">
      	<p className="App-instructions">Enter the code on the device to access controls.</p>
				<div className="App-input-group">
					<input className="App-input" onChange={this.props.handleAuthentication} type="text" required />
					<span className="App-input-highlight"></span>
					<span className="App-input-bar"></span>
					<label className="App-input-label">Device code</label>
				</div>
      </div>
    );
  }
})

export default Authentication;
