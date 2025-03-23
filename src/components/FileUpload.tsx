import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface FileUploadProps {
  groupId: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ groupId }) => {
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    const storageRef = ref(storage, `files/${groupId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'messages'), {
      text: `File: ${file.name}`,
      fileURL: downloadURL,
      createdAt: serverTimestamp(),
      uid: user.uid,
      displayName: user.displayName || user.email,
      groupId
    });

    setFile(null);
  };

  return (
    <div className="flex items-center space-x-2">
      <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" />
      <label htmlFor="fileInput" className="cursor-pointer bg-gray-200 px-4 py-2 rounded-lg">
        Choose File
      </label>
      {file && (
        <>
          <span>{file.name}</span>
          <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Upload
          </button>
        </>
      )}
    </div>
  );
};

export default FileUpload;

