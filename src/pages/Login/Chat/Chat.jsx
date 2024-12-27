import React from 'react'
import './Chat.css'
import RightSidebar from '../../../components/RightSidebar/RightSidebar'
import ChatBox from '../../../components/ChatBox/ChatBox'
import LeftSidebar from '../../../components/LeftSidebar/LeftSidebar'
const Chat = () => {
  return (
    <div className = 'chat'>
      <div className="chat-container">
        <LeftSidebar />
        <ChatBox/>
        <RightSidebar/>
      </div>
    </div>
  )
}

export default Chat
