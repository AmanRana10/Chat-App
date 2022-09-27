/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Button, Modal } from 'rsuite';
import { useModalState } from '../../../misc/custom-hooks';
import ProfileAvatar from '../../dashboard/ProfileAvatar';

const ProfileInfoBtnModal = ({ profile, ...restProps }) => {
  const { isOpen, open, close } = useModalState();
  const shortname = profile.name.split(' ')[0];

  const {name, avatar, createdAt} = profile;

  const memberSince = new Date(createdAt).toLocaleDateString();
  return (
    <div>
      <Button {...restProps} onClick={open} >{shortname}</Button>

      <Modal show={isOpen} onHide={close} >
        <Modal.Header>
          <Modal.Title>{shortname}'s profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <ProfileAvatar
            src={avatar}
            name={name}
            className="width-200 height-200 img-fullsize font-huge"
          />

          <h4 className='mt-2'>{name}</h4>
          <p> Member since {memberSince}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button block onClick={close}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfileInfoBtnModal;
