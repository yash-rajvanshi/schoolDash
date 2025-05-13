'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/lib/api';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PropagateLoader } from 'react-spinners';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
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
    } catch (error) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
            className="absolute -top-24 transform -translate-x-1/2 bg-white rounded-full p-4"
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

        <div className='flex items-center justify-center'>
        {errorMsg && (
          <motion.div
            className="mb-4 text-center text-red-500 text-sm  bg-lamaYellow w-fit py-2 px-3 rounded-full"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {errorMsg}
          </motion.div>
        )}
        </div>

        

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

          <div className="relative">
            {/* Button background with animated edges */}
            <motion.div
              className={`absolute inset-0 bg-blue-600 rounded-lg overflow-hidden ${isLoading ? 'opacity-100' : 'opacity-0'}`}
              initial={false}
              animate={isLoading ? { opacity: 1 } : { opacity: 0 }}
            >
              {/* Top edge animation */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-blue-300"
                animate={isLoading ? {
                  x: ["0%", "100%", "0%"],
                  width: ["30%", "50%", "30%"],
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Bottom edge animation */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300"
                animate={isLoading ? {
                  x: ["100%", "0%", "100%"],
                  width: ["40%", "60%", "40%"],
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Left edge animation */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300"
                animate={isLoading ? {
                  y: ["0%", "100%", "0%"],
                  height: ["30%", "50%", "30%"],
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Right edge animation */}
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-1 bg-blue-300"
                animate={isLoading ? {
                  y: ["100%", "0%", "100%"],
                  height: ["40%", "60%", "40%"],
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{
                  duration: 2.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Actual button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              className={`relative w-full bg-[#3B8A88] hover:bg-[#4AAEAB] text-white py-3 rounded-lg font-semibold tracking-wide transition-all shadow-lg flex items-center justify-center`}
              style={{ minHeight: isLoading ? "46px" : "" }}
            >
              {isLoading ? (
                

                <div className="flex items-center justify-center">
                <PropagateLoader
                color="#fff"
                cssOverride={{}}
                loading
                size={7}
                speedMultiplier={1}
              />
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}