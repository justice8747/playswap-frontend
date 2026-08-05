import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Github, ArrowLeft } from 'lucide-react';

import { AuthContext } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const Login = () => {
  const PlaySwapLogo = ({ className = 'h-12 w-auto' }) => (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="swapGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1DB954" />
          <stop offset="100%" stopColor="#FF0000" />
        </linearGradient>
      </defs>
      <path d="M8 6L34 20L8 34V6Z" fill="url(#swapGradient)" className="drop-shadow-lg" />
      <path
        d="M14 15C18 15 17 25 21 25"
        stroke="#0D0D0D"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-80"
      />
    </svg>
  );

  const { dispatch, isLoading, error } = useContext(AuthContext);

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch({ type: 'LOGIN_START' });

    try {
      const res = await fetch(`http://localhost:3000/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, token: data.token },
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      console.log(err);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { error: err.message },
      });
    }
  };

  const handleLoginWithGoogle = () => {
    window.location.href = `http://localhost:3000/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col relative overflow-hidden font-sans selection:bg-[#1DB954] selection:text-black">
      {/* --- Background Effects --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1DB954]/20 rounded-full blur-[120px] opacity-40 mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF0000]/10 rounded-full blur-[120px] opacity-40 mix-blend-screen"></div>
      </div>

      {/* --- Header / Back Link --- */}
      <div className="relative z-10 p-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors group text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-grow flex items-center justify-center px-4 pb-20 relative z-10">
        <div className="w-full max-w-[420px] animate-fade-in-up">
          {/* Logo & Intro */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white/5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                <PlaySwapLogo className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Enter your credentials to access your library.</p>
          </div>

          {/* Glass Card */}
          <div className="bg-[#121212]/80 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500 group-focus-within:text-[#1DB954] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#1DB954] hover:text-[#1ed760] hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500 group-focus-within:text-[#1DB954] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all"
                  />
                </div>
              </div>

              {/* Error Feedback */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center animate-shake">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold h-11 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#1DB954]/20 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <span className="flex items-center">
                    Log In <ArrowRight className="ml-2" size={18} />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#121212] px-3 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleLoginWithGoogle}
                className="flex items-center justify-center px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <img
                  src="https://img.clerk.com/static/google.svg"
                  className="w-5 h-5 mr-3"
                  alt="Google"
                />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                  Google
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-gray-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="ml-1 text-[#1DB954] hover:text-[#1ed760] font-semibold hover:underline transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
