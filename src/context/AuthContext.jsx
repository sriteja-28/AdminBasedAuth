import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, onAuthStateChanged, doc, getDoc } from "../utils/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        let userData = {};
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        if (firebaseUser.email.toLowerCase() === adminEmail.toLowerCase()) {
          userData.isAdmin = true;
        }
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
