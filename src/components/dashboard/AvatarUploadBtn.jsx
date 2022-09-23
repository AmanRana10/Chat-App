import React, { useRef, useState } from 'react';
import { Alert, Button, Modal } from 'rsuite';
import AvatarEditor from 'react-avatar-editor';
import { useModalState } from '../../misc/custom-hooks';
import { database, storage } from '../../misc/firebase';
import { useProfile } from '../../context/profile.context';
import ProfileAvatar from './ProfileAvatar';

const fileInputTypes = '.png, .jpeg, .jpg';
const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/pjpeg'];

const AvatarUploadBtn = () => {
  const { isOpen, open, close } = useModalState();
  const [img, setImg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const AvatarEditorRef = useRef();
  const { profile } = useProfile();

  const isValidFile = file => {
    return acceptedFileTypes.includes(file.type);
  };

  const getBlob = canvas => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('File Process Error'));
        }
      });
    });
  };

  const onInputFileChange = ev => {
    const currFiles = ev.target.files;
    if (currFiles.length === 1) {
      const file = currFiles[0];
      if (isValidFile(file)) {
        setImg(file);
        open();
      } else {
        Alert.warning(`Wrong file type ${file.type}`, 4000);
      }
    }
  };

  const onUploadClick = async () => {
    const canvas = AvatarEditorRef.current.getImageScaledToCanvas();
    setIsLoading(true);
    try {
      const blob = await getBlob(canvas);
      const AvatarFileRef = storage
        .ref(`/profile/${profile.uid}`)
        .child('avatar');

      const uploadResult = await AvatarFileRef.put(blob, {
        cacheControl: `public, max-age =${3600 * 24 * 3}`
      });

      const downloadURL = await uploadResult.ref.getDownloadURL();

      const userAvatarRef = database.ref(`/profiles/${profile.uid}`).child('avatar');

      const userAvatarSet = await userAvatarRef.set(downloadURL);

      Alert.info("Avatar has been uploaded", 4000);
      setIsLoading(false);
    } catch (error) {
      Alert.error(error.message, 4000);
      setIsLoading(false);
    }
  };
  return (
    <div>
      <div className="mt-3 text-center">
      <ProfileAvatar src={profile.avatar} name={profile.name} className="width-200 height-200 img-fullsize font-huge"/>
        <label
          htmlFor="avatar-upload"
          className="d-block cursor-pointer padded"
        >
          Select new avatar
          <input
            id="avatar-upload"
            type="file"
            className="d-none"
            accept={fileInputTypes}
            onChange={onInputFileChange}
          />
        </label>

        <Modal show={isOpen} onHide={close}>
          <Modal.Header>
            <Modal.Title>Adjust and upload new avatar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-center align-items-center">
              {img && (
                <AvatarEditor
                  ref={AvatarEditorRef}
                  image={img}
                  width={200}
                  height={200}
                  border={50}
                  borderRadius={100}
                  rotate={0}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button block appearance="ghost" onClick={onUploadClick}>
              Upload new avatar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AvatarUploadBtn;
