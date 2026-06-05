import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const API_BASE = 'http://localhost:5000/api';

export default function Testimonials({ currentUser, onSignInClick }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  // Submission flags
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch approved reviews
  const fetchApprovedReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/feedbacks`);
      const data = await res.json();
      if (!data.error) {
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    const finalName = currentUser ? currentUser.name : guestName.trim();
    const finalEmail = currentUser ? currentUser.email : guestEmail.trim();
    const finalAvatar = currentUser ? currentUser.avatar : '';

    if (!finalName) {
      setErrorMsg('Please enter your name or sign in.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Feedback comments cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName,
          email: finalEmail,
          avatar: finalAvatar,
          rating,
          comment: comment.trim()
        })
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setSuccessMsg('Thank you! Your feedback has been submitted and is pending administrator approval.');
        // Reset form
        setComment('');
        setGuestName('');
        setGuestEmail('');
        setRating(5);
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = interactive 
        ? i <= (hoverRating || rating)
        : i <= count;
      
      stars.push(
        <span 
          key={i}
          className={`star-char ${isFilled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => setRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        >
          ★
        </span>
      );
    }
    return <div className="stars-row">{stars}</div>;
  };

  const scrollSlider = (direction) => {
    const track = document.getElementById('testimonials-track');
    if (track) {
      const card = track.querySelector('.feedback-card');
      if (card) {
        const cardWidth = card.offsetWidth;
        const gap = 24; // gap in px
        const scrollAmount = (cardWidth + gap) * direction;
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="reviews" className="section-padding testimonials-section">
      <div className="container">
        <div className="text-center testimonials-header">
          <span className="testimonials-subtitle">Testimonials</span>
          <h2 className="testimonials-title font-display text-gradient">Luxe Experience Reviews</h2>
          <div className="title-divider"></div>
        </div>

        {/* Feedbacks Slider Container */}
        {loading ? (
          <div className="flex-center feedbacks-loading">
            <div className="whisk-loader"></div>
            <p>Gathering client reviews...</p>
          </div>
        ) : (
          <div className="testimonials-slider-container">
            {feedbacks.length > 0 && (
              <>
                <button type="button" className="slider-nav-btn prev-btn" onClick={() => scrollSlider(-1)} aria-label="Previous review">
                  ‹
                </button>
                <button type="button" className="slider-nav-btn next-btn" onClick={() => scrollSlider(1)} aria-label="Next review">
                  ›
                </button>
              </>
            )}

            <div className="testimonials-track" id="testimonials-track">
              {feedbacks.length === 0 ? (
                <div className="glass-card empty-feedbacks-card text-center">
                  <p>Be the first to share your LuxeLayers experience!</p>
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb._id} className="feedback-card glass-card scroll-snap-card">
                    {renderStars(fb.rating)}
                    <p className="feedback-comment">"{fb.comment}"</p>
                    
                    <div className="feedback-author-row">
                      {fb.avatar ? (
                        <img src={fb.avatar} alt={fb.name} className="feedback-avatar" />
                      ) : (
                        <span className="feedback-avatar-initial">{fb.name.charAt(0)}</span>
                      )}
                      <div className="author-meta">
                        <strong className="author-name">{fb.name}</strong>
                        <span className="feedback-date">
                          {new Date(fb.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Feedback Submission Form */}
        <div className="feedback-submission-wrapper glass-card">
          <h3 className="font-display form-title">Share Your Experience</h3>
          <p className="form-subtitle-note">Your review will be posted publicly once verified by our moderation team.</p>

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-row star-rating-row">
              <label>Your Rating</label>
              {renderStars(rating, true)}
            </div>

            {currentUser ? (
              <div className="user-posting-card">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="posting-avatar" />
                ) : (
                  <span className="posting-avatar-initial">{currentUser.name.charAt(0)}</span>
                )}
                <div className="posting-meta">
                  <span>Posting securely as <strong>{currentUser.name}</strong></span>
                  <span className="email-meta">{currentUser.email}</span>
                </div>
              </div>
            ) : (
              <div className="guest-fields-row">
                <div className="input-field">
                  <label htmlFor="feedback-name">Your Name</label>
                  <input
                    type="text"
                    id="feedback-name"
                    placeholder="John Doe"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="feedback-email">Email Address (Optional)</label>
                  <input
                    type="email"
                    id="feedback-email"
                    placeholder="john@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
                <div className="guest-auth-prompt">
                  <span>or</span>
                  <button 
                    type="button" 
                    className="btn-link"
                    onClick={onSignInClick}
                  >
                    Sign in with Google/Facebook
                  </button>
                </div>
              </div>
            )}

            <div className="input-field">
              <label htmlFor="feedback-comment">Comments & Review</label>
              <textarea
                id="feedback-comment"
                placeholder="Share details of your experience with our cakes, taste, and booking process..."
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>

            {errorMsg && <span className="submit-error-msg">⚠️ {errorMsg}</span>}
            {successMsg && <span className="submit-success-msg">✨ {successMsg}</span>}

            <button type="submit" className="btn-primary form-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
