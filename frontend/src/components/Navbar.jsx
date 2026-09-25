// src/components/Navbar.jsx
import React, { useContext, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user: ctxUser, logout } = useContext(AuthContext) || {};
  const [isLogin, setIsLogin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (target) => {
    if (target === 'login') {
      setIsLogin(true);
      navigate('/login');
    } else {
      setIsLogin(false);
      navigate('/register');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // safeUser: prefer context user, fallback to parsed localStorage
  const safeUser = (() => {
    if (ctxUser) return ctxUser;
    try {
      const raw = localStorage.getItem('hams_user');
      if (!raw) return null;
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      return null;
    }
  })();

  // compute initial safely
  const initial = (safeUser?.name?.charAt(0) || safeUser?.email?.charAt(0) || '').toUpperCase();

  const handleLogout = () => {
    // call context logout if provided
    try { if (logout) logout(); } catch (e) { /* ignore */ }
    // always clean storage and redirect
    localStorage.removeItem('hams_user');
    localStorage.removeItem('hams_token');
    navigate('/login');
  };

  return (
    <nav className="sticky bg-gradient-to-r from-lime-100 via-lime-300 to-lime-400 shadow-lg fixed w-full top-0 left-0 z-50">
      <div className="max-w-screen mx-auto px-0 sm:px-0 lg:px-8 py-3">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-14 w-auto ml-2" />
            <div className="hidden md:flex items-center space-x-6 ml-6"></div>
          </div>

          <div className="flex items-center space-x-4 mr-2">
            {safeUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-white text-sm font-medium">
                    {safeUser?.name || safeUser?.email}
                  </span>
                  <span className="text-green-100 text-xs">Welcome back</span>
                </div>

                <div className="relative">
                  <button className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full transition duration-200">
                    <div className="h-8 w-8 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {initial || 'A'}
                      </span>
                    </div>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-white text-emerald-600 hover:bg-green-50 px-4 py-2 rounded-full text-sm font-semibold transition duration-200 shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="relative w-44 h-11 bg-white/30 backdrop-blur-sm rounded-full shadow-inner flex items-center cursor-pointer transition duration-300">
                    <div
                      className={`absolute top-1 bottom-1 w-[48%] rounded-full bg-lime-400 shadow-md transform transition-all duration-300 ${
                        isLogin ? 'translate-x-1' : 'translate-x-[calc(100%+0.25rem)]'
                      }`}
                    />
                    <span
                      onClick={() => handleToggle('login')}
                      className={`flex-1 text-center text-sm font-semibold z-10 transition-colors duration-300 ${
                        isLogin ? 'text-black' : 'text-black/60'
                      }`}
                    >
                      Sign In
                    </span>
                    <span
                      onClick={() => handleToggle('register')}
                      className={`flex-1 text-center text-sm font-semibold z-10 transition-colors duration-300 ${
                        !isLogin ? 'text-black' : 'text-black/60'
                      }`}
                    >
                      Sign Up
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/40 transition duration-200 shadow-sm"
                >
                  {isDarkMode ? (
                    <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden mt-2" />
      </div>
    </nav>
  );
}
