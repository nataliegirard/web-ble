import React from 'react';
import { TextField } from 'material-ui';

const Authentication = React.createClass({
  render() {
    return (
      <div className="App-container">
      	<p className="App-instructions">Enter the code on the device to access controls.</p>
				<div className="App-input-group">
					<TextField floatingLabelText='Device code' onChange={this.props.handleAuthentication} />
				</div>
      </div>
    );
  }
})

export default Authentication;
