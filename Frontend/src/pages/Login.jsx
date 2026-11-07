import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass rounded-3xl p-10 w-full max-w-md"
      >
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Welcome back</h1>
        <p className="text-dino-muted text-sm mb-8">Sign in to continue your journey</p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
            className="mb-4 p-3 rounded-lg bg-dino-danger/10 border border-dino-danger/30 text-dino-danger text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-dino-muted mb-2">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dino-bg border border-dino-accent/20
                         focus:border-dino-accent focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-dino-muted mb-2">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dino-bg border border-dino-accent/20
                         focus:border-dino-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-8">
          Sign In
        </button>

        <p className="text-center text-sm text-dino-muted mt-6">
          No account?{' '}
          <Link to="/register" className="text-dino-glow hover:underline">Create one</Link>
        </p>
      </motion.form>
    </div>
  );
}