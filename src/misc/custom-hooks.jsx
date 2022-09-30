/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { database } from "./firebase";

export const useModalState = (defaultValue = false) => {
    const [isOpen,setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    return { isOpen, close, open};
}

export const useMediaQuery = query => {
    const [matches, setMatches] = useState(
      () => window.matchMedia(query).matches
    );
  
    useEffect(() => {
      const queryList = window.matchMedia(query);
      setMatches(queryList.matches);
  
      const listener = evt => setMatches(evt.matches);
  
      queryList.addListener(listener);
      return () => queryList.removeListener(listener);
    }, [query]);
  
    return matches;
  };
  

  export const usePresence = (uid) => {

    const [presence, setPresence] = useState(null);

    useEffect(() => {
      const userStatusRef = database.ref(`/status/${uid}`);

      userStatusRef.on('value', snap => {
        if(snap.exists())
        {
          const data = snap.val();
          setPresence(data);
        }
      })

      return (()=>{
        userStatusRef.off();
      })
    },[uid]);

    return presence;
  }

  export function useHover() {
    const [value, setValue] = useState(false);
  
    const ref = useRef(null);
  
    const handleMouseOver = () => setValue(true);
    const handleMouseOut = () => setValue(false);
  
    useEffect(
      () => {
        const node = ref.current;
        if (node) {
          node.addEventListener('mouseover', handleMouseOver);
          node.addEventListener('mouseout', handleMouseOut);
  
        }
        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      },
      [ref.current] // Recall only if ref changes
    );
  
    return [ref, value];
  }