import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Group {
  id: string;
  name: string;
}

interface GroupListProps {
  onSelectGroup: (groupId: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'groups'), (snapshot) => {
      const groupData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupData);
    });

    return () => unsubscribe();
  }, []);

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    await addDoc(collection(db, 'groups'), {
      name: newGroupName
    });

    setNewGroupName('');
  };

  return (
    <div className="w-64 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Groups</h2>
      <ul className="space-y-2">
        {groups.map((group) => (
          <li 
            key={group.id} 
            onClick={() => onSelectGroup(group.id)}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded"
          >
            {group.name}
          </li>
        ))}
      </ul>
      <form onSubmit={createGroup} className="mt-4">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full mt-2 p-2 bg-blue-500 text-white rounded">
          Create Group
        </button>
      </form>
    </div>
  );
};

export default GroupList;

