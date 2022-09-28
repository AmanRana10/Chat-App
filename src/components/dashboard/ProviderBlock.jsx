import React, { useState } from 'react';
import firebase from 'firebase/app';
import { Alert, Button, Icon, Tag } from 'rsuite';
import { auth } from '../../misc/firebase';

const ProviderBlock = () => {
  const [isConnected, setIsConnected] = useState({
    'google.com': auth.currentUser?.providerData?.some(
      data => data.providerId === 'google.com'
    ),
    'facebook.com': auth.currentUser?.providerData?.some(
      data => data.providerId === 'facebook.com'
    ),
  });


  const updateIsConnected = (providerId, value) => {
    setIsConnected(p => {
      return {
        ...p,
        [providerId] : value
      }
    })
  };

  const unlink = async(providerId) => {
    try{
      if (auth.currentUser.providerData.length === 1){
        throw new Error(`You cannot disconnect from ${providerId}`); 
      }

      await auth.currentUser.unlink(providerId);
      updateIsConnected(providerId, false);
      Alert.info(`Disconnected from ${providerId}`, 4000);

    }catch (err){
      Alert.error(err.message, 4000);
    }
  
  }
  const unlinkGoogle = () => {
    unlink('google.com');
  }
  const unlinkFacebook = () => {
    unlink('facebook.com')
  }

  const link = async (provider) => {
    try {
      await auth.currentUser.linkWithPopup(provider);
      Alert.success(`Linked to ${provider.providerId}`)
      updateIsConnected(provider.providerId, true);
    }catch (err) {
      Alert.error(err.message);
    }
  }

  const linkGoogle = () => {
    link(new firebase.auth.GoogleAuthProvider())
  }
  const linkFacebook = () => {
    link(new firebase.auth.FacebookAuthProvider())
  }
  return (
    <div>
      {isConnected['google.com'] && (
        <Tag color="green" closable onClose={unlinkGoogle}>
          <Icon icon="google" /> Connected
        </Tag>
      )}
      {isConnected['facebook.com'] && (
        <Tag color="blue" closable onClose={unlinkFacebook}>
          <Icon icon="facebook" /> Connected
        </Tag>
      )}

      <div className="mt-2">
        {!isConnected['google.com'] && (
          <Button block color="green" onClick={linkGoogle}>
            Link to Google
          </Button>
        )}
        {!isConnected['facebook.com'] && (
          <Button block color="blue" onClick={linkFacebook}>
            Link to Facebook
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProviderBlock;
