// const LoginPage = () => {
//   return (
//     <div className=''>LoginPage</div>
//   )
// }

// export default LoginPage

// app/sign-in/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/lib/api';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const result = await login(email, password);

    if (result.success) {
    //   router.push('/admin'); // or wherever you want to redirect
    // } else {
    //   setErrorMsg(result.message || 'Login failed');
    // }
    const role = result.user.role; // assuming result.user has a 'role' property

    // Save token and user data in localStorage if needed
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    // Redirect based on role
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'teacher') {
      router.push('/teacher');
    } else if (role === 'parent') {
      router.push('/parent');
    } else if (role === 'student') {
      router.push('/student');
    } else {
      setErrorMsg('Unknown role. Please contact support.');
    }
  } else {
    setErrorMsg(result.message || 'Login failed');
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm"
      >
        <div className="flex justify-center mb-4">
          <Image src="/sin.png" alt="logo" width={200} height={30} />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

        {errorMsg && (
          <div className="mb-4 text-red-500 text-sm text-center">{errorMsg}</div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2">Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2">Password</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}