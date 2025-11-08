import React, { useState, useEffect } from 'react';
import { Modal } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import {
  closeLogInModal,
  openLogInModal,
  closeSignUpModal,
  openSignUpModal,
} from '../redux/slices/modalSlice';
// heroicons v2 exports under subpaths
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginOpen = useSelector((state: RootState) => state.modals.logInModalOpen);
  const signUpOpen = useSelector((state: RootState) => state.modals.signUpModalOpen);
  const dispatch = useDispatch<AppDispatch>();
  // compute supabase config presence directly from Vite env to avoid HMR export race
  const isSupabaseConfigured = Boolean((import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY);
  const { login } = useAuth();

  // Clear fields whenever the modal opens (either login or sign up)
  useEffect(() => {
    if (loginOpen || signUpOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  }, [loginOpen, signUpOpen]);

  async function handleLogIn() {
    if (!isSupabaseConfigured) {
      // Local/demo fallback when Supabase isn't configured: create a local session
      login(email, 'local-demo-token');
      dispatch(closeLogInModal());
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } else {
      dispatch(closeLogInModal());
    }
  }

  async function handleSignUp() {
    if (!isSupabaseConfigured) {
      // Demo fallback: create a local account and log in immediately
      login(email, 'local-demo-token');
      dispatch(closeSignUpModal());
      alert('Demo account created locally (no confirmation email sent).');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    } as any);
    if (error) {
      console.error('Sign up error:', error);
      alert('Sign up failed. Please try again.');
    } else {
      dispatch(closeSignUpModal());
      alert('Sign up successful. Check your email to confirm if required.');
    }
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          className="w-full md:w-[120px] h-[48px] md:h-[40px] text-md md:text-sm rounded-full text-white font-bold bg-blue-700 hover:bg-blue-800 transition"
          onClick={() => dispatch(openLogInModal())}
        >
          Log In
        </button>
        <button
          className="hidden md:inline-block md:w-[120px] h-[48px] md:h-[40px] text-md md:text-sm rounded-full text-blue-700 font-bold border-2 border-blue-700 bg-white hover:bg-blue-50 transition"
          onClick={() => dispatch(openSignUpModal())}
        >
          Sign Up
        </button>
      </div>

      <Modal
        open={loginOpen || signUpOpen}
        onClose={() => {
          dispatch(closeLogInModal());
          dispatch(closeSignUpModal());
        }}
        className="flex justify-center items-center"
      >
        <div className="w-full h-full sm:w-[600px] sm:h-fit bg-white sm:rounded-xl">
          <XMarkIcon
            className="w-7 mt-5 ms-5 cursor-pointer"
            onClick={() => {
              dispatch(closeLogInModal());
              dispatch(closeSignUpModal());
            }}
          />
          <div className="pt-10 pb-20 px-4 sm:px-20">
            <h1 className="text-3xl font-bold mb-10 text-gray-900">{signUpOpen ? 'Create an account' : 'Log in to your account'}</h1>
            <div className="w-full space-y-5 mb-10">
              <input
                className="w-full h-[54px] border border-gray-200 outline-none ps-3 rounded-[4px] text-gray-900 placeholder:text-gray-400
                focus:border-blue-700 transition"
                placeholder="Email"
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                value={email}
              />
              <div
                className="w-full h-[54px] border border-gray-200 outline-none rounded-[4px]
                focus-within:border-blue-700 transition flex items-center overflow-hidden pr-3"
              >
                <input
                  className="w-full h-full outline-none ps-3 text-gray-900 placeholder:text-gray-400"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  onChange={(event) => setPassword(event.target.value)}
                  value={password}
                />
                <div
                  className="w-7 h-7 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </div>
              </div>
              <button
                className="font-bold bg-blue-700 text-white h-[48px] rounded-full shadow-md mb-5 w-full hover:cursor-pointer"
                onClick={signUpOpen ? handleSignUp : handleLogIn}
              >
                {signUpOpen ? 'Create account' : 'Log In'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SignIn;
