import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Enhanced Sign-Up
export const signUp = async (email, password, userData) => {
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return Promise.reject("Invalid email or password type");
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...userData, // e.g., { name: "John Doe", age: 25 }
      email: user.email,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Error during sign-up: ", error);
    throw error;
  }
};

// Sign In
export const signIn = async (email, password) => {
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return Promise.reject("Invalid email or password type");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error during sign-in: ", error);
    throw error;
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if the user already exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Save user data if it's a new user
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("Error during Google sign-in: ", error);
    throw error;
  }
};

// Fetch User Data
export const fetchUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.error("No such user found!");
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }
};

// Sign Out
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};
