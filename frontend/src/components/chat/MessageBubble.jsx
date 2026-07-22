const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] p-3 rounded-lg ${
        isOwn ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white' : 'bg-gray-200 text-gray-800'
      }`}>
        <p>{message.message}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export default MessageBubble