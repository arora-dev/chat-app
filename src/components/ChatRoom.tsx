import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  uid: string;
  photoURL?: string;
  displayName?: string;
  createdAt: any;
}

interface ChatRoomProps {
  selectedUserId?: string;
  groupId?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ selectedUserId, groupId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;

    let q;
    if (selectedUserId) {
      // Direct messages
      q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', [user.uid, selectedUserId].sort().join('_')),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
    } else if (groupId) {
      // Group messages
      q = query(
        collection(db, 'messages'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
    } else {
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user, selectedUserId, groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    try {
      setSending(true);
      const messageData = {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        photoURL: user.photoURL,
        displayName: user.displayName || user.email
      };

      if (selectedUserId) {
        messageData['participants'] = [user.uid, selectedUserId].sort().join('_');
      } else if (groupId) {
        messageData['groupId'] = groupId;
      }

      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.uid === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[70%] ${
                msg.uid === user?.uid ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <img
                src={msg.photoURL || '/placeholder.svg?height=40&width=40'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.uid === user?.uid
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-xs mb-1">{msg.displayName}</p>
                <p className="break-words">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;

