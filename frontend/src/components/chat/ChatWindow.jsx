import MessageBubble from './MessageBubble'

const ChatWindow = ({ messages, currentUser }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => (
        <MessageBubble
          key={idx}
          message={msg}
          isOwn={msg.senderId === currentUser?._id}
        />
      ))}
    </div>
  )
}

export default ChatWindow