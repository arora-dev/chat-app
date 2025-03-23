import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  lastSeen?: any;
  online?: boolean;
}

interface UserListProps {
  onSelectUser: (userId: string) => void;
  selectedUserId?: string;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, selectedUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(u => u.id !== user.uid) as User[]; // Exclude current user
      
      // Remove duplicates based on user ID
      const uniqueUsers = Array.from(new Map(userList.map(item => [item.id, item])).values());
      setUsers(uniqueUsers);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="bg-navy-800">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 rounded-lg bg-navy-700 text-white placeholder-gray-400 focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelectUser(u.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2 hover:bg-navy-700 ${
              selectedUserId === u.id ? 'bg-navy-700' : ''
            }`}
          >
            <div className="relative">
              <img
                src={u.photoURL || '/placeholder.svg?height=40&width=40'}
                alt={u.displayName || u.email}
                className="w-10 h-10 rounded-full"
              />
              {u.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-navy-800" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">{u.displayName || u.email}</p>
              <p className="text-sm text-gray-400">
                {u.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserList;

