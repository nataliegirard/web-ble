import React from "react";
import { RaisedButton } from "material-ui";
import HeartRateService from "./heartRateService";
import { rgb, colors } from "./Colors";

const heartRate = new HeartRateService();

const calculateColor = heartRateValue => {
  let color = {};
  if (heartRateValue >= 130) {
    color.rgb = rgb[0];
    color.hex = colors[0];
  } else if (heartRateValue >= 120) {
    color.rgb = rgb[1];
    color.hex = colors[1];
  } else if (heartRateValue >= 110) {
    color.rgb = rgb[2];
    color.hex = colors[2];
  } else if (heartRateValue >= 100) {
    color.rgb = rgb[3];
    color.hex = colors[3];
  } else if (heartRateValue >= 90) {
    color.rgb = rgb[4];
    color.hex = colors[4];
  } else if (heartRateValue >= 80) {
    color.rgb = rgb[5];
    color.hex = colors[5];
  } else if (heartRateValue >= 70) {
    color.rgb = rgb[6];
    color.hex = colors[6];
  } else if (heartRateValue >= 60) {
    color.rgb = rgb[7];
    color.hex = colors[7];
  } else {
    color.rgb = rgb[8];
    color.hex = colors[8];
  }
  return color;
};

const HeartRateSelection = React.createClass({
  getInitialState() {
    return {
      connected: false,
      buttonText: this.props.text,
      errorMessage: "",
      heartRateValue: 0,
      candleColor: "red"
    };
  },
  connectHeartRate() {
    if (this.state.connected) {
      heartRate.disconnect();
      this.setState({
        connected: false,
        buttonText: this.props.text
      });
    } else {
      this.setState({
        buttonText: "Connecting..."
      });
      heartRate
        .connect()
        .then(() => {
          this.setState({
            connected: true,
            buttonText: "Disconnect Heart Rate"
          });
          heartRate
            .readSensorLocation()
            .then(location => console.log("reading from ", location));
          return heartRate
            .startHeartRateNotifications()
            .then(this.handleHeartRateNotifications);
        })
        .catch(error => {
          this.setState({
            connected: false,
            buttonText: this.props.text,
            errorText: "Error, please try again"
          });
          console.log("error connecting to heart rate monitoring device");
        });
    }
  },
  handleHeartRateNotifications(heartRateMeasurement) {
    heartRateMeasurement.addEventListener(
      "characteristicvaluechanged",
      event => {
        const heartRateValue = heartRate.parseHeartRate(event.target.value);
        const candleColor = calculateColor(heartRateValue);
        this.props.handleColorChange(candleColor);
        this.setState({
          heartRateValue,
          candleColor: candleColor.hex
        });
      }
    );
  },
  render() {
    return (
      <RaisedButton
        className="HR-button"
        label={this.state.buttonText}
        primary={true}
        onTouchTap={this.connectHeartRate}
      />
    );
  }
});

export default HeartRateSelection;
