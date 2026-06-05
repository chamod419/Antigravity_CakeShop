import React, { useState, useEffect } from 'react';
import { GOOGLE_CLIENT_ID, FB_APP_ID } from '../config';
import './AuthModal.css';

export default function AuthModal({ onClose, onLogin, onRegister, onSocialLogin }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isPlaceholderId, setIsPlaceholderId] = useState(false);

  // Initialize Google GIS and Facebook SDK
  useEffect(() => {
    // Check if placeholder IDs are active
    if (GOOGLE_CLIENT_ID.startsWith('109832791823')) {
      setIsPlaceholderId(true);
      console.warn('LuxeLayers: Using placeholder GOOGLE_CLIENT_ID. Configure src/config.js for live login.');
    }

    // 1. Google sign-in initialization
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 180, text: "signin_with" }
        );
      } catch (err) {
        console.error('Failed to initialize Google Sign-In:', err);
      }
    }

    // 2. Facebook SDK initialization
    if (window.FB) {
      window.FB.init({
        appId      : FB_APP_ID,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
    } else {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId      : FB_APP_ID,
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
      };
    }
  }, []);

  const decodeGoogleToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error decoding JWT token:', err);
      return null;
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    const payload = decodeGoogleToken(response.credential);
    if (!payload) {
      setErrors({ submit: 'Failed to authenticate with Google.' });
      return;
    }

    setLoading(true);
    try {
      const user = await onSocialLogin({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        provider: 'google',
        providerId: payload.sub
      });
      if (user) onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Google account connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setErrors({ submit: 'Facebook SDK failed to load. Please verify connection.' });
      return;
    }

    setLoading(true);
    window.FB.login((response) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'name,email,picture.type(large)' }, async (profile) => {
          try {
            const user = await onSocialLogin({
              name: profile.name,
              email: profile.email || `${profile.id}@facebook.com`,
              avatar: profile.picture?.data?.url,
              provider: 'facebook',
              providerId: profile.id
            });
            if (user) onClose();
          } catch (err) {
            setErrors({ submit: err.message || 'Facebook account link failed.' });
          } finally {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
        setErrors({ submit: 'Facebook login cancelled or blocked by user.' });
      }
    }, { scope: 'email,public_profile' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginTab) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLoginTab) {
        const user = await onLogin(formData.email, formData.password);
        if (user) onClose();
        else setErrors({ submit: 'Invalid email or password' });
      } else {
        const user = await onRegister(formData.name, formData.email, formData.password);
        if (user) onClose();
        else setErrors({ submit: 'Registration failed. Email might already exist.' });
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Authentication error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay flex-center animate-fade" onClick={onClose}>
      <div className="auth-card glass-card animate-zoom" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>×</button>
        
        {/* Tab Selection */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${isLoginTab ? 'active' : ''}`}
            onClick={() => { setIsLoginTab(true); setErrors({}); }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab-btn ${!isLoginTab ? 'active' : ''}`}
            onClick={() => { setIsLoginTab(false); setErrors({}); }}
          >
            Register
          </button>
        </div>

        {isPlaceholderId && (
          <div className="placeholder-warning-note">
            ⚠️ <strong>Config Required:</strong> Configure <code>src/config.js</code> with actual App credentials to test live Google/Facebook authorizations.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginTab && (
            <div className="input-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                type="text"
                id="auth-name"
                name="name"
                placeholder="Nadeesha Perera"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="input-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              type="email"
              id="auth-email"
              name="email"
              placeholder="you@luxe.com"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="input-field">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {!isLoginTab && (
            <div className="input-field">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="auth-confirm-password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          )}

          {errors.submit && <span className="field-error submit-err-msg">{errors.submit}</span>}

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : isLoginTab ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="social-divider">
          <span>or sign in with</span>
        </div>

        {/* Real Google and Facebook login button targets */}
        <div className="social-actions-row">
          <div id="google-signin-btn" className="real-google-btn-wrapper"></div>
          
          <button className="social-btn btn-facebook" onClick={handleFacebookLogin} disabled={loading}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
