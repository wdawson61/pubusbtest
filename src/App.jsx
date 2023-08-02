import React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub/lib/Providers";
import ReactLoading from "react-loading";
import config from "../pubsub.json"
export default function App() {
  const [gps1Data, setGps1Data] = useState(null);

  function ListGPSPos({posData}) {
    if (gps1Data) {
      console.log("Data received from pubsub=",posData);
      return (Object.keys(posData).map((key) => (
        <li key={key}> {posData[key]} </li>
        )
    ))}    
    else {
      return (
        <ReactLoading type = "spinningBubbles" color ="#0"/>)
    }

  }
  
  function decodeGPSData(input) {
    switch (input.fPort)
    {
      case 2:
        const obj = {};
        obj.data = input.data;
        obj.fPort = input.fPort;
        setGps1Data(obj);
        break;
      default:
    }
  }

  useEffect(() => {
    console.log("----------- BEFORE =>configure(): Amplify=")
    console.log(...Object.entries(Amplify).flat(20),"\n\n")
    Amplify.configure({
      Auth: {
        identityPoolId: config.REACT_APP_IDENTITY_POOL_ID,
        region: config.REACT_APP_REGION,
        userPoolId: config.REACT_APP_USER_POOL_ID,
        userPoolWebClientId: config.REACT_APP_USER_POOL_WEB_CLIENT_ID
      }
    });
    console.log("----------- AFTER =>configure(): amplify=",...Object.entries(Amplify).flat(20));
    
    let iotProvider = new AWSIoTProvider({
      aws_pubsub_region: config.REACT_APP_REGION,
      aws_pubsub_endpoint: `wss://${config.REACT_APP_MQTT_ID}/mqtt`,
    });
    //console.log("result from new AWSIotProvider: iotProvider=", iotProvider);

    Amplify.addPluggable(iotProvider);
    //console.log("AFTER =>addPluggable(): Amplify=", Amplify);
    
    const subscription = Amplify.PubSub.subscribe("application/Tracking/device/313932316e30740b/rx").subscribe({
      next: data => decodeGPSData(data.value, data.fPort),
      error: error => console.error(error),
      close: () => console.log("Done"),
    });
    console.log("After subscription.subscribe... Leaving useEffect()");
    
    return () => {
      console.log("Cleanup function from useEffect... unsubscribe()");
      subscription.unsubscribe();
    }
  }, []);
  return (
    <>
      <h1>AWS IOT Core test</h1>
      <ListGPSPos posData = {gps1Data} />
    </>
  );
};
