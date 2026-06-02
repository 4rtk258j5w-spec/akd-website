"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface Permissions {
  posts: boolean;
  videos: boolean;
  ads: boolean;
  settings: boolean;
  admins: boolean;
}

const DEFAULT_PERMISSIONS: Permissions = {
  posts: false,
  videos: false,
  ads: false,
  settings: false,
  admins: false,
};

export function usePermissions() {
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [permissions, setPermissions] = useState<Permissions>(DEFAULT_PERMISSIONS);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setIsOwner(false);
        setPermissions(DEFAULT_PERMISSIONS);
        return;
      }

      try {
        // Check if current user is owner
        const ownerUid = typeof window !== "undefined"
          ? localStorage.getItem("akd_owner_uid")
          : null;

        if (ownerUid && ownerUid === user.uid) {
          setIsOwner(true);
          setPermissions({ posts: true, videos: true, ads: true, settings: true, admins: true });
          setLoading(false);
          return;
        }

        // Fetch permissions from Firestore
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          setPermissions({ ...DEFAULT_PERMISSIONS, ...(data.permissions || {}) });
        } else {
          setPermissions(DEFAULT_PERMISSIONS);
        }
      } catch {
        setPermissions(DEFAULT_PERMISSIONS);
      }

      setIsOwner(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { loading, isOwner, permissions };
}
