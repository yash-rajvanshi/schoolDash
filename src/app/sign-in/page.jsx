'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/lib/api';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const [bgPosition, setBgPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgPosition((prev) => (prev + 1) % 100);
    }, 100); // Adjust speed here
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const result = await login(email, password);

    if (result.success) {
      const role = result.user.role;
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      if (role === 'admin') router.push('/admin');
      else if (role === 'teacher') router.push('/teacher');
      else if (role === 'parent') router.push('/parent');
      else if (role === 'student') router.push('/student');
      else setErrorMsg('Unknown role. Please contact support.');
    } else {
      setErrorMsg(result.message || 'Login failed');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(270deg, #fef9c3, #ffffff, #bae6fd)',
        backgroundSize: '600% 600%',
        backgroundPosition: `${bgPosition}% 50%`,
        transition: 'background-position 0.1s ease'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="relative bg-white shadow-2xl border border-gray-200 rounded-3xl p-10 w-full max-w-md backdrop-blur-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 60, delay: 0.2 }}
      >

        <div className='flex justify-center items-center'>
          <motion.div
            className="absolute -top-24  transform -translate-x-1/2 bg-white rounded-full p-4 "
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Image src="/sin.png" alt="Scholio" width={200} height={70} />
          </motion.div>
        </div>

        <motion.h2
          className="text-center text-3xl font-bold text-gray-800 mb-8 mt-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Welcome Back to Campus!
        </motion.h2>

        {errorMsg && (
          <motion.div
            className="mb-4 text-center text-red-500 text-sm"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            className="mb-5"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-gray-600 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            />
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <label className="block text-gray-600 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            />
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold tracking-wide transition-all shadow-lg"
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}