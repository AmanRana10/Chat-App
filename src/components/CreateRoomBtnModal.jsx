import React, { useRef, useState } from 'react';
import {
  Alert,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon,
  Modal,
  Schema,
} from 'rsuite';
import firebase  from 'firebase/app';
import { useModalState } from '../misc/custom-hooks';
import { database } from '../misc/firebase';

const INITIAL_VALUE = {
  name: '',
  description: '',
};

const CreateRoomBtnModal = () => {
  const { isOpen, open, close } = useModalState();
  const [formData, setFormData] = useState(INITIAL_VALUE);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef();

  const onFormChange = val => {
    setFormData(val);
  };

  const { StringType } = Schema.Types;

  const model = Schema.Model({
    name: StringType().isRequired('Chat name is required'),
    description: StringType().isRequired('Description is required'),
  });

  const onSubmit = async () => {
    if(!formRef.current.check())
      return;

    setIsLoading(true);

    const newRoomData = {
      ...formData,
      createdAt : firebase.database.ServerValue.TIMESTAMP
    }

    try {

      await database.ref(`rooms`).push(newRoomData);
      Alert.info(`${formData.name} has been created`, 4000);

      setFormData(INITIAL_VALUE);
      setIsLoading(false);
      close();      

    } catch (error) {
      setIsLoading(false);
      Alert.error(`${error.message}`, 4000)
    }
  };
  return (
    <div>
      <Button block color="green" onClick={open} className="mt-2">
        <Icon icon="creative" /> Create new chat room
      </Button>

      <Modal show={isOpen} onHide={close}>
        <Modal.Header>
          <Modal.Title>New Chat Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            fluid
            onChange={onFormChange}
            formValue={formData}
            model={model}
            ref={formRef}
          >
            <FormGroup>
              <ControlLabel>Room Name</ControlLabel>
              <FormControl name="name" placeholder="Enter chat room name..." />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                componentClass="textarea"
                rows={5}
                name="description"
                placeholder="Enter chat room name..."
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button block appearance="primary" onClick={onSubmit} disabled={isLoading}>
            Create new chat room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRoomBtnModal;
