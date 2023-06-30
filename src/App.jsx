import React from 'react';
import './App.css';
import { useState, useEffect } from "react";
//import { Buffer } from 'node:buffer';
import { Amplify } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import ReactLoading from 'react-loading';
const struct = require('python-struct');

export default function App() {
  const [gps1Data, setGps1Data] = useState({});

  function ListGPSPos({posData}) {
    if (Object.keys(posData).length === 0) {
      return (
        <ReactLoading type = "spinningBubbles" color ="#0"/>)
    }

     return (Object.keys(posData).map((key) => (
        <li> {key}: {posData[key]} </li>
        )
    ))    
  }
  
  function decodeGPSData(input) {
    let buf = Buffer.from(input.data, 'base64');
    switch (input.fPort)
    {
      case 2:
        const arr = struct.unpack('llHB',buf), obj = {};
        [obj.latitude, obj.longitude, obj.hAcc, obj.battery] = arr;
        obj.latitude *= 0.0000001;
        obj.longitude *= 0.0000001;
        setGps1Data(obj);
        break;
      default:
    }
  }

  useEffect(() => {
    Amplify.configure({
      Auth: {
        identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
        region: process.env.REACT_APP_REGION,
        userPoolId: process.env.REACT_APP_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID
      }
    });
    
    Amplify.addPluggable(new AWSIoTProvider({
      aws_pubsub_region: process.env.REACT_APP_REGION,
      aws_pubsub_endpoint: `wss://${process.env.REACT_APP_MQTT_ID}/mqtt`,
    }));
    
    Amplify.PubSub.subscribe('application/Tracking/device/313932316e30740b/rx').subscribe({
      next: data => decodeGPSData(data.value, data.fPort),
      error: error => console.error(error),
      close: () => console.log('Done'),
    });
    
  }, []);
  return (
    <>
      <h1>Realtime Weather2</h1>
      <ListGPSPos posData = {gps1Data}>
      </ListGPSPos>
    </>
  );
};
