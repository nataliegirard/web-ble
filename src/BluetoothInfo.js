import React from 'react';

const BluetoothInfo = (props) => (
	<div>
		<h1>Web Bluetooth API</h1>
		<ul className="App-info">
			<li>Interact with nearby bluetooth devices with a website.</li>
			<li>Uses Bluetooth Low Energy (Bluetooth 4) and Generic Attribute Profile (GATT).</li>
			<li>Request to connect must be triggered by user and must be served over HTTPS.</li>
			<li>Uses JavaScript promises and the navigator.bluetooth object.</li>
			<li>Available as of Chrome 56. Enable flag in browser:<br/>
				chrome://flags/#enable-experimental-web-platform-features
			</li>
		</ul>
		<a href="https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web" target='_blank'>Web Bluetooth API</a>
	</div>
)

export default BluetoothInfo;
