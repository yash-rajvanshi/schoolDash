// 'use client';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export const useAuth = () => {
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.push('/sign-in'); // adjust path if different
//     }
//   }, []);
// };

// src/app/hooks/useAuth.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/sign-in');
    } else {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse user:', err);
        router.push('/sign-in');
      }
    }

    setLoading(false);
  }, []);

  return { loading, user };
};