import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Alert } from 'rsuite';
import { auth, database } from '../../../misc/firebase';
import { transformToArray } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const Message = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {
    const messagesRef = database.ref('/messages');

    messagesRef
      .orderByChild('roomId')
      .equalTo(chatId)
      .on('value', snap => {
        const data = transformToArray(snap.val());

        setMessages(data);
      });

    return () => {
      messagesRef.off();
    };
  }, [chatId]);

  const handleAdmin = useCallback(
    async uid => {
      const adminsRef = database.ref(`/rooms/${chatId}/admins`);
      let infoMsg;
      await adminsRef.transaction(admins => {
        if (admins) {
          if (admins[uid]) {
            admins[uid] = null;
            infoMsg = 'Admin permission revoked';
          } else {
            admins[uid] = true;
            infoMsg = 'Admin permission granted';
          }
        }
        return admins;
      });

      Alert.info(infoMsg, 4000);
    },
    [chatId]
  );

  const handleLike = useCallback(async msgId => {
    const { uid } = auth.currentUser;
    const messageRef = database.ref(`/messages/${msgId}`);

    let infoMsg;
    await messageRef.transaction(msg => {
      if (msg) {
        if (msg.likes && msg.likes[uid]) {
          msg.likeCount -= 1;
          msg.likes[uid] = null;

          infoMsg = 'Like Removed';
        } else {
          msg.likeCount += 1;
          if (!msg.likes) msg.likes = {};

          msg.likes[uid] = true;
          infoMsg = 'Liked message';
        }

        Alert.info(infoMsg, 4000);
      }
      return msg;
    });
  }, []);

  const handleDelete = useCallback(async (msgId) => {
    // eslint-disable-next-line no-alert
    if(!window.confirm("Delete this message ?")){
      return;
    }

    const isLast = messages[messages.length - 1].id === msgId;

    const updates = {} ;

    updates[`/messages/${msgId}`] = null;
    if(isLast && messages.length > 1) {
      updates[`/rooms/${chatId}/lastMessage`] = {
        ...messages[messages.length - 2],
        msgId : messages[messages.length - 2].id
      }
    }

    if(isLast && messages.length === 1) {
      updates[`/rooms/${chatId}/lastMessage`] = null;
    }

    try {
      await database.ref().update(updates);
      Alert.info("Message deleted", 4000);
    } catch (err) {
      Alert.error(err.message, 3000);
    }

  }, [chatId, messages]);

  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li> No messages yet .</li>}
      {canShowMessages &&
        messages.map(msg => (
          <MessageItem
            key={msg.id}
            message={msg}
            handleAdmin={handleAdmin}
            handleLike={handleLike}
            handleDelete={handleDelete}
          />
        ))}
    </ul>
  );
};

export default Message;
