import React from 'react';
import './App.css';
import { useState, useEffect } from "react";

import { Amplify } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

export default function App() {
  const [trackerInfo, setTrackerInfo] = useState({fcnt:1});
  function dataHere(dd) {
    console.log(dd);
    setTrackerInfo(dd);
  };
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
      next: data => dataHere(data.value),
      error: error => console.error(error),
      close: () => console.log('Done'),
    });
    
  }, []);
  return (
    <>
      <h1>Realtime Weather2</h1>
      <h1>data: {trackerInfo.fCnt}</h1>
      <p>Check the console..</p>
    </>
  );
};

 
