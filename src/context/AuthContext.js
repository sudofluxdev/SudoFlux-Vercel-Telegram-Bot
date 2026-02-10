"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.error("Firebase auth instance is null. Check environment variables.");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (user.email === "sudofluxdev@gmail.com") {
                    setUser(user);
                    setIsAdmin(true); // Super Admin Hardcoded
                } else {
                    console.warn(`Unauthorized access attempt: ${user.email}`);
                    await signOut(auth);
                    setUser(null);
                    setIsAdmin(false);
                    alert("ACCESS DENIED: Restricted to sudofluxdev@gmail.com");
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        if (!auth) {
            console.error("Firebase Auth not initialized. Cannot login.");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    const logout = () => {
        if (!auth) return;
        signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loginWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
