// Purpose: Shows a persistent floating chat action button that routes users to the messaging screen.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ChatFloatButton = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <button
      onClick={() => navigate(isAuthenticated ? '/messages' : '/login')}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
      aria-label="Open chat"
      title="Open chat"
    >
      💬
    </button>
  );
};

export default ChatFloatButton;
