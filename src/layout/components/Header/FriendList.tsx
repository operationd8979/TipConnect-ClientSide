import React from 'react';
import {FriendShip} from '../../../type';

const FriendList = ( {listFriend} : {listFriend:FriendShip[]} ) => {
  console.log('Rendering FriendList');
  return (
    <ul>
      {listFriend.map((friendShip) => {
        console.log(friendShip.id);
        return <li key={friendShip.id.toString()}>{friendShip.friend.fullName}</li>;
      })}
    </ul>
  );
}

export default React.memo(FriendList);
