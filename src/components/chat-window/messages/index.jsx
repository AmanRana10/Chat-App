import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router'
import { database } from '../../../misc/firebase';
import { transformToArray } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const Message = () => {
  const {chatId} = useParams();
  const [messages, setMessages] = useState(null);

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {
    const messagesRef = database.ref('/messages');

    messagesRef.orderByChild('roomId').equalTo(chatId).on('value', snap => {
      const data = transformToArray(snap.val());

      setMessages(data);
    })
    
    return () => {
      messagesRef.off();
    }
  }, [chatId])
  
  return (
    <ul className='msg-list custom-scroll'>
      {isChatEmpty && <li> No messages yet .</li>}
      {canShowMessages && messages.map(msg => <MessageItem key={msg.id} message={msg}/>)}
    </ul>
  )
}

export default Message