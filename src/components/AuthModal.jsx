import React, { useState } from 'react';
import './AuthModal.css';

export default function AuthModal({ onClose, onLogin, onRegister, onSocialLogin }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
        // Log in
        const user = await onLogin(formData.email, formData.password);
        if (user) onClose();
        else setErrors({ submit: 'Invalid email or password' });
      } else {
        // Register
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

  // Google / Facebook Mock OAuth Popup Flow
  const handleSocialClick = (provider) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '',
      `${provider}-login`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,status=no`
    );

    if (!popup) {
      alert('Popup blocker active. Please allow popups to sign in with social networks.');
      return;
    }

    const brandColor = provider === 'google' ? '#4285F4' : '#1877F2';
    const brandName = provider === 'google' ? 'Google' : 'Facebook';
    
    // HTML content for the popup window
    popup.document.write(`
      <html>
        <head>
          <title>Authorize with ${brandName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #f7f9fa;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
              padding: 2rem;
              box-sizing: border-box;
            }
            .auth-card {
              background: white;
              padding: 2.5rem;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              max-width: 360px;
              width: 100%;
            }
            .logo {
              font-size: 2.5rem;
              font-weight: bold;
              color: ${brandColor};
              margin-bottom: 1.5rem;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid #e1e8ed;
              border-top-color: ${brandColor};
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 1.5rem auto;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            h2 {
              font-size: 1.2rem;
              color: #1c1e21;
              margin: 0 0 0.5rem 0;
            }
            p {
              font-size: 0.9rem;
              color: #606770;
              margin-bottom: 2rem;
            }
            .user-profile {
              display: flex;
              align-items: center;
              gap: 12px;
              background: #f0f2f5;
              padding: 10px 16px;
              border-radius: 8px;
              text-align: left;
              margin-bottom: 2rem;
            }
            .user-profile img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
            }
            .user-details {
              display: flex;
              flex-direction: column;
            }
            .user-name {
              font-weight: 600;
              color: #1c1e21;
              font-size: 0.9rem;
            }
            .user-email {
              font-size: 0.8rem;
              color: #606770;
            }
            .btn {
              background: ${brandColor};
              color: white;
              border: none;
              padding: 0.8rem 1.5rem;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              font-size: 0.9rem;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="auth-card" id="step-1">
            <div class="logo">${provider === 'google' ? 'G' : 'f'}</div>
            <h2>Sign in with ${brandName}</h2>
            <p>LuxeLayers is requesting permission to access your profile name and email address.</p>
            <div class="spinner"></div>
            <span style="font-size:0.8rem;color:#909090;">Connecting to secure authorization server...</span>
          </div>

          <div class="auth-card" id="step-2" style="display:none;">
            <div class="logo">${provider === 'google' ? 'G' : 'f'}</div>
            <h2>Confirm Account Link</h2>
            <p>Continue to LuxeLayers as:</p>
            <div class="user-profile">
              <img src="${
                provider === 'google' 
                  ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                  : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
              }" alt="Profile avatar" />
              <div class="user-details">
                <span class="user-name">${provider === 'google' ? 'Roshan Silva' : 'Nadeesha Perera'}</span>
                <span class="user-email">${provider === 'google' ? 'roshan.silva@gmail.com' : 'nadeesha@facebook.com'}</span>
              </div>
            </div>
            <button class="btn" id="confirm-btn">Continue</button>
          </div>

          <script>
            // Simulate OAuth handshake
            setTimeout(() => {
              document.getElementById('step-1').style.display = 'none';
              document.getElementById('step-2').style.display = 'block';
            }, 1500);

            document.getElementById('confirm-btn').addEventListener('click', () => {
              const profile = {
                name: "${provider === 'google' ? 'Roshan Silva' : 'Nadeesha Perera'}",
                email: "${provider === 'google' ? 'roshan.silva@gmail.com' : 'nadeesha@facebook.com'}",
                avatar: "${
                  provider === 'google' 
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
                    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
                }",
                provider: "${provider}",
                providerId: "${provider}-" + Math.floor(1000000000000 + Math.random() * 9000000000000)
              };
              
              // Callback to parent window
              window.opener.postMessage({ type: 'social-login-success', profile }, '*');
              window.close();
            });
          </script>
        </body>
      </html>
    `);

    // Setup listener in the main page for popup callback message
    const receiveMessage = async (event) => {
      if (event.data.type === 'social-login-success') {
        window.removeEventListener('message', receiveMessage);
        setLoading(true);
        try {
          const user = await onSocialLogin(event.data.profile);
          if (user) onClose();
        } catch (err) {
          setErrors({ submit: 'Social login connection failed.' });
        } finally {
          setLoading(false);
        }
      }
    };
    window.addEventListener('message', receiveMessage);
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

        {/* Social Authentication buttons */}
        <div className="social-actions-row">
          <button className="social-btn btn-google" onClick={() => handleSocialClick('google')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-7.989 0-4.41 3.529-7.989 7.859-7.989 2.47 0 4.12 1.026 5.064 1.933l2.457-2.36C18.172 2.22 15.457 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c7.06 0 11.75-4.97 11.75-11.96 0-.8-.086-1.42-.19-1.84L12.24 10.285z"/>
            </svg>
            Google
          </button>
          <button className="social-btn btn-facebook" onClick={() => handleSocialClick('facebook')}>
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
