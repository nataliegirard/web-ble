import React from 'react';
import { Drawer, MenuItem, Divider } from 'material-ui';
import PhoneIcon from 'material-ui/svg-icons/hardware/smartphone';
import LinkIcon from 'material-ui/svg-icons/content/link';
import BluetoothIcon from 'material-ui/svg-icons/device/bluetooth';
import WifiIcon from 'material-ui/svg-icons/device/wifi-tethering';
import ControlsIcon from 'material-ui/svg-icons/action/settings-applications';

const SideMenu = (props) => (
	<Drawer
		open={props.menuVisible}
		docked={false}
		onRequestChange={props.onRequestChange}
		className='App-menu'>
			<MenuItem
				leftIcon={<ControlsIcon />}
				onTouchTap={props.handleControls}>
					Controls
			</MenuItem>
			<Divider />
	    <MenuItem
	    	leftIcon={<WifiIcon />}
	    	onTouchTap={props.handleBeacon}>
	    		Beacon Technology
	    </MenuItem>
	    <MenuItem
	    	leftIcon={<PhoneIcon />}
	    	onTouchTap={props.handlePWA}>
	    		Progressive Web Apps
	    </MenuItem>
	    <MenuItem
	    	leftIcon={<BluetoothIcon />}
	    	onTouchTap={props.handleBluetooth}>
	    		Web Bluetooth API
	    </MenuItem>
	    <Divider />
	    <MenuItem
	    	disabled={!props.connected}
	    	leftIcon={<LinkIcon />}
	    	onTouchTap={props.handleDisconnect}>
	    		Disconnect device
	    	</MenuItem>
  </Drawer>
)

export default SideMenu;
