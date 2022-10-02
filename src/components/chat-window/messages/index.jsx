/* eslint-disable consistent-return */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button } from 'rsuite';
import { auth, database, storage } from '../../../misc/firebase';
import { groupBy, transformToArray } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const PAGE_LIMIT = 15;
const messagesRef = database.ref('/messages');
const Message = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;
  const selfRef = useRef();

  const loadMessages = useCallback((limitToLast) => {
    messagesRef.off();
    
    messagesRef
      .orderByChild('roomId')
      .equalTo(chatId)
      .limitToLast(limitToLast || PAGE_LIMIT)
      .on('value', snap => {
        const data = transformToArray(snap.val());

        setMessages(data);
      });

      setLimit(p => p + PAGE_LIMIT);
  }, [chatId]);


  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;

    loadMessages(limit);

    setTimeout(() => {
      const newHeight = node.scrollHeight;
    
      node.scrollTop = newHeight - oldHeight;
    
    }, 400);
  },[limit, loadMessages])

  useEffect(() => {
    const node = selfRef.current;

    loadMessages();
    
    setTimeout(() => {
      node.scrollTop = node.scrollHeight;
    }, 400);

    return () => {
      messagesRef.off('value');
    };
  }, [loadMessages]);

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

  const handleDelete = useCallback(
    async (msgId, file) => {
      // eslint-disable-next-line no-alert
      if (!window.confirm('Delete this message ?')) {
        return;
      }

      const isLast = messages[messages.length - 1].id === msgId;

      const updates = {};

      updates[`/messages/${msgId}`] = null;
      if (isLast && messages.length > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          msgId: messages[messages.length - 2].id,
        };
      }

      if (isLast && messages.length === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }

      try {
        await database.ref().update(updates);
        Alert.info('Message deleted', 4000);
      } catch (err) {
        return Alert.error(err.message, 3000);
      }

      if (file) {
        try {
          const fileRef = storage.refFromURL(file.url);
          await fileRef.delete();
        } catch (err) {
          Alert.error(err.message, 3000);
        }
      }
    },
    [chatId, messages]
  );

  const renderFunction = () => {
    const groups = groupBy(messages, item =>
      new Date(item.createdAt).toDateString()
    );

    const item = [];
    Object.keys(groups).forEach(date => {
      item.push(
        <li key={date} className="text-center mb-1 padded">
          {date}
        </li>
      );

      const msgGrp = groups[date].map(msg => {
        return (
          <MessageItem
            key={msg.id}
            message={msg}
            handleAdmin={handleAdmin}
            handleLike={handleLike}
            handleDelete={handleDelete}
          />
        );
      });
      item.push(...msgGrp);
    });

    return item;
  };
  return (
    <ul ref={selfRef} className="msg-list custom-scroll">
      {messages && messages.length >= PAGE_LIMIT && 
      <li className='text-center mt-2 mb-2'>
        <Button onClick={onLoadMore} color='green'>
          Load More
        </Button>
      </li>}
      {isChatEmpty && <li> No messages yet .</li>}
      {canShowMessages && renderFunction()}
    </ul>
  );
};

export default Message;
