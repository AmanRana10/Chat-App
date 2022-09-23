import React from 'react'
import { Avatar } from 'rsuite'
import { getInitials } from '../../misc/helpers'

const ProfileAvatar = ({name , ...AvatarProps}) => {
  return (
    <Avatar circle {...AvatarProps}>
        {getInitials(name)}
    </Avatar>
  )
}

export default ProfileAvatar