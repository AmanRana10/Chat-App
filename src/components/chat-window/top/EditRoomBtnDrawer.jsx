import React from 'react'
import { useParams } from 'react-router';
import { Alert, Button, Drawer } from 'rsuite';
import { useMediaQuery, useModalState } from '../../../misc/custom-hooks'
import {useCurrentRoom} from '../../../context/current-room.context'
import EditableInput from '../../EditableInput';
import { database } from '../../../misc/firebase';

const EditRoomBtnDrawer = () => {
  const {isOpen, open, close} = useModalState();
  const name = useCurrentRoom(v => v.name);
  const description = useCurrentRoom(v => v.description);
  const {chatId} = useParams();
  const isMobile = useMediaQuery('(max-width : 992px)');

  const updateData = (key, value) => {
    database.ref(`/rooms/${chatId}`).child(key).set(value).then(()=>{
        Alert.success("Successfully updated", 4000);
    }).catch(err => {
        Alert.error(err.message, 4000);
    })
  }

  const onNameSave = (newName) => {
    updateData('name', newName)
  }

  const onDescriptionSave = (newDesc) => {
    updateData('description', newDesc);
  }


  return (
    <div>
        <Button className='br-circle' size='sm' onClick={open} color='red'>
            A
        </Button>
        <Drawer full={isMobile} show={isOpen} placement="right" onHide={close} >
            <Drawer.Header>
                <Drawer.Title>
                    Edit Room
                </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
                <EditableInput 
                    initialValue={name}
                    onSave={onNameSave}
                    label={<h6 className='mb-2'>Name</h6>}
                    emptyMsg="Name cannot be empty"
                />
                <EditableInput 
                    componentClass="textArea"
                    rows={5}
                    initialValue={description}
                    onSave={onDescriptionSave}
                    emptyMsg="Description cannot be empty"
                    wrapperClassName="mt-3"
                />
            </Drawer.Body>
            <Drawer.Footer>
                <Button block onClick={close}>
                    Close
                </Button>
            </Drawer.Footer>
        </Drawer>
    </div>
  )
}

export default EditRoomBtnDrawer