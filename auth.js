// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase'; // db is your Firestore instance
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch additional SaaS data (like plan type) from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setCurrentUser({ ...user, ...userDoc.data() });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// authActions.js
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const signUpUser = async (email, password, fullName) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;

  // Initialize the user's SaaS profile
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    plan: "free", // Default SaaS tier
    createdAt: serverTimestamp(),
    usageCount: 0  // Useful for JAMOFNumbers tracking
  });
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  // Check if doc exists, if not, create it (omitted for brevity)
};
import { useState } from 'react';
import { signUpUser } from './authActions';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin) await signUpUser(email, password, "New User");
      // Redirect to /dashboard after success
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-2">JAMOFNumbers</h2>
        <p className="text-center text-gray-500 mb-8">
          {isLogin ? "Welcome back! Please login." : "Start your 14-day free trial."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Get Started"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <hr className="w-full border-gray-200" />
          <span className="px-2">OR</span>
          <hr className="w-full border-gray-200" />
        </div>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-indigo-600 text-sm font-medium hover:underline"
        >
          {isLogin ? "Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
};"Add log in code from gemini"
