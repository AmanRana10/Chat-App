import React from 'react'
import { Badge, Icon, IconButton, Tooltip, Whisper } from 'rsuite'

const ConditionalBadge = ({condition, children}) => {
    return condition ? <Badge content={condition}>{children}</Badge> : children;
}

const IconBtnControl = ({
    isVisible,
    iconName,
    tooltip,
    onClick,
    badgeContent,
    ...iconProps
}) => {
  return (
    <div className='ml-2' style={{visibility : isVisible ? 'visible' : 'hidden'}}>
        <ConditionalBadge condition={badgeContent} >
            <Whisper 
                placement='top'
                delay={0}
                delayHide={0}
                trigger="hover"
                speaker={<Tooltip>{tooltip}</Tooltip>}
            >
                <IconButton 
                    {...iconProps}
                    circle
                    size='xs'
                    onClick={onClick}
                    icon = {<Icon icon = {iconName}/>}
                />
            </Whisper>
        </ConditionalBadge>
    </div>
  )
}

export default IconBtnControl