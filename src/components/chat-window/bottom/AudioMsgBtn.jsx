import React, { useCallback, useState } from 'react';
import { ReactMic } from 'react-mic';
import { useParams } from 'react-router';

import { Alert, Icon, InputGroup } from 'rsuite';
import { storage } from '../../../misc/firebase';

const AudioMsgBtn = ({ afterUpload }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { chatId } = useParams();

  const onClick = useCallback(() => {
    setIsRecording(p => !p);
  }, []);

  const onUpload = useCallback(async (f) => {
    try {

        setIsUploading(true);
        const snap = await storage
          .ref(`/chats/${chatId}`)
          .child(`audio_${Date.now()}.mp3`)
          .put(f.blob, {
            cacheControl: `public , max-age=${3600 * 24 * 3}`,
          });

        const files = {
            content : snap.metadata.contentType,
            name : snap.metadata.name,
            url : await snap.ref.getDownloadURL()
        }
        
        afterUpload([files]);
        setIsUploading(false);
    } catch (err) {
        Alert.error(err.message, 4000);
        setIsUploading(false);
    }
  }, [afterUpload, chatId]);

  return (
    <InputGroup.Button onClick={onClick} disabled={isUploading} className={isRecording ? 'animate-blink' : ''}>
      <Icon icon="microphone" />
      <ReactMic
        record={isRecording}
        className="d-none"
        onStop={onUpload}
        mimeType="audio/mp3"
      />
    </InputGroup.Button>
  );
};

export default AudioMsgBtn;
