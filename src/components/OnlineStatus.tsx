import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const OnlineStatus: React.FC = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const userStatusRef = doc(db, 'status', user.uid);

    const updateOnlineStatus = async () => {
      await setDoc(userStatusRef, {
        online: true,
        lastSeen: new Date()
      });
    };

    updateOnlineStatus();

    const unsubscribe = onSnapshot(doc(db, 'status', 'aggregate'), (doc) => {
      if (doc.exists()) {
        setOnlineUsers(doc.data()?.online || []);
      }
    });

    return () => {
      unsubscribe();
      setDoc(userStatusRef, {
        online: false,
        lastSeen: new Date()
      });
    };
  }, [user]);

  return (
    <div className="p-4 bg-gray-100">
      <h3 className="font-bold mb-2">Online Users</h3>
      <ul>
        {onlineUsers.map((userId) => (
          <li key={userId} className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>{userId}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineStatus;

