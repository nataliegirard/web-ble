# TorontoJS Workshop on May 9, 2017
The web is receiving more native mobile functionality with the arrival of the Web Bluetooth API, which allows web applications accessed from a Bluetooth enabled device to interact with Bluetooth IoT and wearable devices. This workshop will give you information about - and the opportunity to use - the new Web Bluetooth API.

## Motivation
There's been a lot of recent additions to the web that allows websites to complete actions that were only previously possible through native mobile apps. With Progressive Web Apps, websites can behave similarly to installed native applications by adding the web app to the homescreen, providing offline support, and using push notifications. With the Web Bluetooth API, websites on mobile (or Bluetooth-enabled devices) can now interact with nearby Bluetooth peripherals in a secure/private way.

For more information on the Web Bluetooth API, check out this article: https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web

Demo of PWA interacting with a Playbulb Candle:
https://nataliegirard.github.io/web-ble/


## Background
[Bluetooth Low Energy](https://www.bluetooth.com/what-is-bluetooth-technology/how-it-works/low-energy) (aka Bluetooth 4.0 or Bluetooth Smart) is a power-efficient version of Bluetooth for Internet of Things (IoT) devices. [Generic Attributes](https://www.bluetooth.com/specifications/generic-attributes-overview) (GATT) is a data structure which is used to standardize messages sent and received by BLE devices. A GATT profile is a hierarchy of services and characteristics that describe the functionality of the BLE device.

![GATT Profile Hierarchy](https://www.bluetooth.com/~/media/images/page-content/gatt%20profile%20hierarchy.ashx?la=en&hash=5809F05343EB927D9E9680E4CA70556B4ED69A67)

A primary service encapsulates services and characteristics related to an individual functionality of the device. Services and characteristics are identified with a UUID, in the full 128-bit form or the shorter 16 or 32-bit forms. Some services are [standardized](https://www.bluetooth.com/specifications/gatt/services) which allows the name to be used instead of a UUID.

Characteristics can be of different types but the most common are `read`, `write` and `notify`. The characteristic's descriptors provide information about the characteristic's value.

Values are stored in an [ArrayBuffer](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) and received in a [DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) (which provides an interface for reading from an ArrayBuffer).

## Web Bluetooth API
The Web Bluetooth API is available in Chrome as of version 56 for Chrome OS, Android M, Mac, Linux and Windows (need to `enable-experimental-web-platform-features` flag). The API uses JavaScript [promises](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) and has a small interface to allow a website to connect to a nearby BLE device, retrieve its services and characteristics, and read or write to those characteristics. 

### Request
For security reasons, in order to discover nearby Bluetooth devices the call to `navigator.bluetooth.requestDevice` must be triggered by a user action. Therefore we must start by using an event listener. 

The `requestDevice` function takes an object that defines the filters. The filters can be an array of `services` UUIDs, the `name` of the device, or a `namePrefix`. When using `name` or `namePrefix` you will also need to specify `optionalServices` in order to access them. The `requestDevice` function resolves the promise with a `BluetoothDevice` object.

```javascript
// Event listener
button.addEventListener('pointerup', (event) => {
  // call navigator.bluetooth.requestDevice
})
```
```javascript
// Request device using services filter
navigator.bluetooth.requestDevice({
  filters: [{
    services: ['battery_service']
  }]
}).then(device =>{ … })
```
```javascript
// Request device using name
navigator.bluetooth.requestDevice({
  filters: [{
    name: 'test device'
  }],
  optionalServices: ['battery_service']
}).then(device =>{ … })
```

### Connect
The `BluetoothDevice` contains the device's unique `id`, its human-readable `name`, the `gatt` server object (an instance of `BluetoothRemoteGATTServer`), and a `watchAdvertiesements` method (used for beacons).

To connect to the GATT server, we call the device's `gatt.connect` method which resolves the promise with the GATT server object. This is also a good time to add an event listener to handle the `gattserverdisconnected` event. Use `device.gatt.disconnect()` to manually disconnect from the gatt server (which will also trigger the `gattserverdisconnected` event).

```javascript
navigator.bluetooth.requestDevice({...})
  .then(device => {
    device.addEventListener('gattserverdisconnected', onDisconnected)
    return device.gatt.connect()
  }).then(server => { … })

function onDisconnected(event) {
  let device = event.target
  console.log('Device ' + device.name + ' is disconnected.')
}
```

### Get Primary Service
The `BluetoothRemoteGattServer` object contains a reference back to the `device`, a boolean indicating if it is `connected`, `connect` and `disconnect` methods, and `getPrimaryService` and `getPrimaryServices` (for getting multiple services) methods. To be able to read or write to the device, we have to first get the primary service (BluetoothRemoteGATTService instance) from the GATT server.

```javascript
navigator.bluetooth.requestDevice({ … })
  .then(device => { … })
  .then(server => {
    return server.getPrimaryService('battery_service')
  }).then(service => { … })
```

### Get Characteristic
The `BluetoothRemoteGATTService` object contains a reference to the `device`, its `uuid`, a boolean for `isPrimary` to indicate if it is a primary or secondary service, `getCharacteristic` and `getCharacteristics` (for many characteristics) methods, and `getIncludedService` and `getIncludedServices` (get many services) methods to access connected services. The `getCharacteristic` takes the characteristic UUID as a parameter and resolves the promise with the `BluetoothRemoteGATTCharacteristic` instance.

```javascript
navigator.bluetooth.requestDevice({ … })
  .then(device => { … })
  .then(server => { … })
  .then(service => {
    return service.getCharacteristic('battery_level')
  }).then(characteristic => { … })
```

### Read and Write to Characteristic
The `BluetoothRemoteGATTCharacteristic` object contains a reference to its `service`, its `uuid`, its `properties` (instance of `BluetoothCharacteristicProperties`), its `value`, `getDescriptor` and `getDescriptors` methods which resolve with `BluetoothGATTDescriptor` objects, a `readValue` method which resolves with a `DataView`, a `writeValue` method which is called with a `BufferSource` parameter, and `startNotifications` and `stopNotifications` methods for `notify`/`indicate` characteristic types. There is a `characteristicvaluechanged` event which is triggered on read or notify characteristics when the value has changed.

```javascript
navigator.bluetooth.requestDevice({ … })
  .then(device => { … })
  .then(server => { … })
  .then(service => { … })
  .then(characteristic => {
    // read a value
    return characteristic.readValue()

    // notify characteristic types require a call to start notifications
    characteristic.startNotifications()

    // add event listener for changed values, also for notify types
    characteristic.addEventListener('characteristicvaluechanged', handleBatteryLevelChanged)

    // write a value
    let buffer = Uint8Array.of(1)
    return characteristic.writeValue(buffer) // would not resolve with a value
  }).then(value => {
    console.log('Battery percentage is ' + value.getUint8(0))
  })

function handleBatteryLevelChanged(event) {
  let batteryLevel = event.target.value.getUint8(0)
  console.log('Battery percentage is ' + batteryLevel)
}
```

### Resources
Above code samples taken from https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web)

MDN docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API

Examples from Web Bluetooth Community Group: https://github.com/WebBluetoothCG/demos

## Live Coding and Simulators
For our coding exercise we'll connecting to the `heart_rate` service with simulated BLE peripherals on our mobile phones.

To make it easier to find your own device (in the sea of Bluetooth devices), it will be easier to give your device simulation a unique name that you'll be able to filter on.

Start coding using the code in the [workshop-start](https://github.com/nataliegirard/web-ble/tree/workshop-start) branch. Our goal is to complete something similar to the code in the [workshop-goal](https://github.com/nataliegirard/web-ble/tree/workshop-goal) branch.

### iPhone
The [LightBlue Explorer](https://itunes.apple.com/ca/app/lightblue-explorer-bluetooth-low-energy/id557428110?mt=8) app on iOS allows the simulation of BLE devices as well as discover and read nearby BLE devices (more on this later). There were some issues getting a connection to the simulator when using an iPhone 7.

At the bottom of the first screen there is a link to `Create Virtual Peripheral` which will give a list of pre-configured peripherals. Choose to create a `Heart Rate` peripheral. The heart rate values will change over time automatically.

Change the name of the virtual peripheral, it should be a field under General at the top.

### Android
The Web Bluetooth Community Group has provided a [BLE Peripheral Simulator](https://play.google.com/store/apps/details?id=io.github.webbluetoothcg.bletestperipheral&hl=en) for Androids. This app only works on certain chipsets and with Android 5.0 Lollipop or later. [List of supported devices](https://altbeacon.github.io/android-beacon-library/beacon-transmitter-devices.html).

Within the app, choose to simulate a `Heart Rate Monitor` peripheral. The device name will be the name you set for your Android device under Bluetooth settings.

For this app you'll have to click on the `NOTIFY` button to send a notification through the `heart_rate_measurement` characteristic.

## Connecting to Other Devices
It can be difficult to figure out how to read or write to BLE characteristics without a tutorial or documentation. There are tools available that will let you see the available service and characteristic UUIDs and even allow you to read or write to the characteristics.

On Chrome, go to `chrome://bluetooth-internals`.

On Android, use the [nRFConnect](https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp&hl=en) app.

On iPhone, the [LightBlue Explorer](https://itunes.apple.com/ca/app/lightblue-explorer-bluetooth-low-energy/id557428110?mt=8) app will work.

* Article using the nRFConnect app to reverse engineer a bluetooth lightbulb: https://medium.com/@urish/reverse-engineering-a-bluetooth-lightbulb-56580fcb7546


## Other resources
* Chrome Web Bluetooth Samples: https://googlechrome.github.io/samples/web-bluetooth/index.html
* Web Bluetooth class generator: https://beaufortfrancois.github.io/sandbox/web-bluetooth/generator/
* MDN docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
* Web Bluetooth specification: https://webbluetoothcg.github.io/web-bluetooth/
* Samples from WebBluetoothCG: https://github.com/WebBluetoothCG/demos
* Device information characteristics: https://googlechrome.github.io/samples/web-bluetooth/device-information-characteristics.html
