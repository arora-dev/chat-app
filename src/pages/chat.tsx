import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import ChatRoom from '../components/ChatRoom';
import UserList from '../components/UserList';
import UserProfile from '../components/UserProfile';

const Chat: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="flex h-screen bg-navy-900">
      <div className="w-80 flex flex-col border-r border-navy-700">
        <UserList onSelectUser={setSelectedUserId} selectedUserId={selectedUserId} />
      </div>
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <ChatRoom selectedUserId={selectedUserId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-white">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
      <div className="w-80 border-l border-navy-700">
        <UserProfile />
      </div>
    </div>
  );
};

export default Chat;

