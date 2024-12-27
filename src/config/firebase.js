// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"; // Added signOut import
import { getFirestore, setDoc, doc } from "firebase/firestore"; // Added Firestore imports
import { toast } from "react-toastify";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8UWgg_Q2kbFVb2CRre56yws3MnSsbPzU",
  authDomain: "chat-app-gs-eb446.firebaseapp.com",
  projectId: "chat-app-gs-eb446",
  storageBucket: "chat-app-gs-eb446.appspot.com",
  messagingSenderId: "302947802481",
  appId: "1:302947802481:web:af749bb0bcd176418caad0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialized Firestore

// Signup function
const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password); // Sign up the user
    const user = res.user;

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, there! I am using the chat app", // Updated bio text slightly
      lastSeen: Date.now() // Set initial lastSeen to current time
    });

    // Initialize an empty chat for the user
    await setDoc(doc(db, "chats", user.uid), {
      chatData: []
    });

    toast.success("Signup successful!"); // Notify success
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" ")); // Notify error
  }
};

// Login function
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password); // Fixed typo (emial to email)
    toast.success("Login successful!");
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" ")); // Corrected typo (spllit to split)
  }
};

// Logout function
const logout = async () => {
  try {
    await signOut(auth); // Added await to signOut
    toast.success("Logged out successfully!");
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" ")); // Corrected typo (spllit to split)
  }
};

export { signup, login, logout, auth, db };
