import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Stethoscope, Shield, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('engineering');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // If already logged in, redirect to appropriate dashboard
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user?.isLoggedIn) {
          if (user.role === 'admin' || user.is_admin) {
            navigate('/admin');
          } else if (user.role === 'medical') {
            navigate('/dashboard/medical');
          } else {
            navigate('/dashboard/engineering');
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [navigate]);

  const validate = () => {
    if (!email || !password) return 'Please fill in all fields.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (!isLogin && password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { name: email.split('@')[0], email, password, role };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      const userData = {
        ...data.user,
        isLoggedIn: true,
        token: data.token
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('auth_token', data.token);

      // Route based on role
      if (userData.role === 'admin' || userData.is_admin) {
        navigate('/admin');
      } else if (userData.role === 'medical') {
        navigate('/dashboard/medical');
      } else {
        navigate('/dashboard/engineering');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const fillQuickDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsLogin(true);
    setRole(demoRole);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-centered-content">
        <div className="auth-promo">
          <h1 className="gradient-text">SkillSwap</h1>
          <p>Peer Learning Network &amp; Verified Competency Platform</p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Log in to continue' : 'Join the community today'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && <div className="auth-error">⚠ {error}</div>}
            {successMsg && <div className="auth-success">✓ {successMsg}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Select Track</label>
                <div className="role-selection">
                  <button
                    type="button"
                    id="role-engineering"
                    className={`role-btn ${role === 'engineering' ? 'active' : ''}`}
                    onClick={() => setRole('engineering')}
                  >
                    <Briefcase size={20} />
                    <span>Engineering</span>
                  </button>
                  <button
                    type="button"
                    id="role-medical"
                    className={`role-btn ${role === 'medical' ? 'active' : ''}`}
                    onClick={() => setRole('medical')}
                  >
                    <Stethoscope size={20} />
                    <span>Medical</span>
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="btn-full"
              isLoading={isLoading}
              id="auth-submit-btn"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px', textAlign: 'center', fontWeight: 700 }}>
              Quick Demo Logins
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@skillswap.com', 'admin')}
                style={{
                  background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24', padding: '6px 4px', borderRadius: '6px', fontSize: '0.72rem',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
                title="Log in as Platform Administrator"
              >
                <Shield size={12} /> Admin
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('alex@example.com', 'engineering')}
                style={{
                  background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa', padding: '6px 4px', borderRadius: '6px', fontSize: '0.72rem',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
                title="Log in as Alex (Engineering)"
              >
                <Briefcase size={12} /> Engineering
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('emily@example.com', 'medical')}
                style={{
                  background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399', padding: '6px 4px', borderRadius: '6px', fontSize: '0.72rem',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
                title="Log in as Emily (Medical)"
              >
                <Stethoscope size={12} /> Medical
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={handleToggleMode} className="toggle-auth" id="toggle-auth-mode">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
