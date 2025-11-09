import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase, SUPABASE_EMAIL_REDIRECT_TO } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const deriveDisplayName = (email: string | null | undefined) => {
  if (!email) return 'User';
  const [usernamePart] = email.split('@');
  if (!usernamePart) return email;
  return usernamePart.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginOpen = useSelector((state: RootState) => state.modals.logInModalOpen);
  const signUpOpen = useSelector((state: RootState) => state.modals.signUpModalOpen);
  const dispatch = useDispatch<AppDispatch>();
  const { login } = useAuth();

  const resetFields = useCallback(() => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
  }, []);

  // Clear fields whenever the modal opens (either login or sign up)
  useEffect(() => {
    if (loginOpen || signUpOpen) {
      resetFields();
    }
  }, [loginOpen, signUpOpen, resetFields]);

  async function handleLogIn() {
    if (!email || !password) {
      alert('Enter both email and password to log in.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Login error:', error);
      const message = String(error.message || 'Login failed. Please try again.');
      if (message.toLowerCase().includes('email')) {
        try {
          await supabase.auth.resend({ type: 'signup', email });
          alert('Your email is not confirmed yet. We just sent a fresh confirmation email—please check your inbox.');
        } catch (resendError) {
          console.error('Resend confirmation error:', resendError);
          alert(`${message}\nIf email confirmation is required, confirm the address in Supabase or resend the link from the dashboard.`);
        }
      } else {
        alert(message);
      }
    } else {
      const sessionToken = data.session?.access_token ?? '';
      const supabaseId = data.user?.id ?? null;
      const displayName = deriveDisplayName(data.user?.email ?? email);
      login(displayName, sessionToken, supabaseId, data.user?.email ?? email);
      dispatch(closeLogInModal());
      resetFields();
    }
  }

  async function handleSignUp() {
    if (!email || !password) {
      alert('Enter both email and password to create an account.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: SUPABASE_EMAIL_REDIRECT_TO,
      },
    } as any);
    if (error) {
      console.error('Sign up error:', error);
      alert(`Sign up failed: ${error.message ?? 'Please try again.'}`);
    } else {
      const sessionToken = data?.session?.access_token ?? '';
      const supabaseId = data?.user?.id ?? null;
      const displayName = deriveDisplayName(data?.user?.email ?? email);

      dispatch(closeSignUpModal());
      resetFields();

      if (sessionToken) {
        login(displayName, sessionToken, supabaseId, data?.user?.email ?? email);
      }

      alert(
        data?.session
          ? 'Sign up successful! You are now logged in.'
          : 'Sign up successful. Check your inbox for a confirmation email to finish activating your account.'
      );
    }
  }

  return (
    <>
      <Modal
        open={loginOpen || signUpOpen}
        onClose={() => {
          dispatch(closeLogInModal());
          dispatch(closeSignUpModal());
          resetFields();
        }}
        className="flex justify-center items-center"
      >
        <div className="w-full h-full sm:w-[600px] sm:h-fit bg-white sm:rounded-xl">
          <XMarkIcon
            className="w-7 mt-5 ms-5 cursor-pointer"
            onClick={() => {
              dispatch(closeLogInModal());
              dispatch(closeSignUpModal());
              resetFields();
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
                className="font-bold bg-linear-to-r from-cyan-400 to-cyan-600 text-white h-[48px] rounded-full shadow-md mb-5 w-full hover:from-cyan-500 hover:to-cyan-700 hover:cursor-pointer"
                onClick={signUpOpen ? handleSignUp : handleLogIn}
              >
                {signUpOpen ? 'Create account' : 'Log In'}
              </button>
              <div className="text-center text-sm text-gray-900">
                {signUpOpen ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-0"
                      onClick={() => {
                        resetFields();
                        dispatch(closeSignUpModal());
                        dispatch(openLogInModal());
                      }}
                    >
                      Log in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-0"
                      onClick={() => {
                        resetFields();
                        dispatch(closeLogInModal());
                        dispatch(openSignUpModal());
                      }}
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SignIn;
