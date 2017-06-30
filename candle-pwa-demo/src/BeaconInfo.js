import React from 'react';

const BeaconInfo = (props) => (
	<div>
		<h3>Bluetooth Low Energy Beacon</h3>
		<ul className="App-info">
			<li>Transmit a secure URL using a Bluetooth Low Energy signal.</li>
			<li>Range of transmission can be varied.</li>
			<li>Appears as low-priority notification on smart phone devices.</li>
			<li>Allows passersby to quickly access the given URL.</li>
			<li>Quick discoverability of web applications or online user manuals.</li>
		</ul>
		<a href="https://google.github.io/physical-web/" target='_blank'>Google's Physical Web</a>
	</div>
)

export default BeaconInfo;
