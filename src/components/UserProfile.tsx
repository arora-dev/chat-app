import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    try {
      setUploading(true);
      const file = e.target.files[0];
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update auth profile
      await updateProfile(auth.currentUser!, {
        photoURL: photoURL
      });
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: photoURL
      });
      
    } catch (error) {
      console.error('Error uploading profile photo:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-navy-900 text-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img
            src={user?.photoURL || '/placeholder.svg?height=100&width=100'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <label
            htmlFor="photo-upload"
            className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600"
          >
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </label>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{user?.displayName || 'User'}</h2>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

