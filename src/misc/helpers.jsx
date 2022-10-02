/* eslint-disable array-callback-return */
export const getInitials = name => {
  const splitName = name.toUpperCase().split(' ');
  if (splitName.length > 1) {
    return splitName[0][0] + splitName[1][0];
  }

  return splitName[0][0];
};

export const transformToArr = snapVal => {
  return snapVal ? Object.keys(snapVal) : [];
}


export const transformToArray = snapVal => {
//   console.log('snap',snapVal);
  return snapVal
  ? Object.keys(snapVal).map(roomId => {
        return { ...snapVal[roomId], id: roomId };
      })
    : [];
};

export async function getUserUpdates(userId, keyToUpdate, value, db) {
  const updates = {};

  updates[`/profiles/${userId}/${keyToUpdate}`] = value;

  const getMsgs = db.ref(`/messages`).orderByChild('author/uid').equalTo(userId).once('value');

  const getRooms = db.ref('/rooms').orderByChild('lastMessage/author/uid').equalTo(userId).once('value');

  const [mSnap, rSnap] = await Promise.all([getMsgs, getRooms]);

  mSnap.forEach(msg => {
    updates[`messages/${msg.key}/author/${keyToUpdate}`] = value;
  })

  rSnap.forEach(room => {
    updates[`rooms/${room.key}/lastMessage/author/${keyToUpdate}`] = value;
  })


  return updates;
}


export const groupBy = (array, groupingKeyFunction) => {

  return array.reduce((results, item) => {
  
    const groupKey = groupingKeyFunction(item);

    if(!results[groupKey]) {
      results[groupKey] = [];
    }

    results[groupKey].push(item);
    return results;
  },{})

}