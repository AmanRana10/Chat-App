/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { auth, database } from '../misc/firebase';

const ProfileContext = createContext();

export const isOfflineForDatabase = {
  state: 'offline',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userRef;
    let userStatusRef;
    const authUnsub = auth.onAuthStateChanged(authObj => {
      if (authObj) {
        userStatusRef = database.ref(`/status/${authObj.uid}`);
        userRef = database.ref(`/profiles/${authObj.uid}`);

        userRef.on('value', snap => {
          const { name, createdAt, avatar } = snap.val();
          const data = {
            name,
            createdAt,
            avatar,
            uid: authObj.uid,
            email: authObj.email,
          };
          // console.log(data);

          setProfile(data);
          setIsLoading(false);
        });

        database
          .ref('.info/connected')
          .on('value', snapshot => {
            if (!!snapshot.val() === false) {
              return;
            }

            userStatusRef
              .onDisconnect()
              .set(isOfflineForDatabase)
              .then(() => {
                userStatusRef.set(isOnlineForDatabase);
              });
          });
          
      } else {
        if (userRef) {
          userRef.off();
        }

        if (userStatusRef) {
          userStatusRef.off();
        }

        database.ref('.info/connected').off();
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (userRef) userRef.off();

      if (userStatusRef) {
        userStatusRef.off();
      }

      database.ref('.info/connected').off();
      authUnsub();
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ isLoading, profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
