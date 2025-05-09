import { useState } from 'react';
import api from '../../api'; // make sure the path is correct
import { useNavigate } from 'react-router';

export default function RegistrationForm() {

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = 'Enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // ✅ If no errors, return true
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [id]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      const response = await api.register(formData);
      console.log('Registration success:', response);
      setSuccess('Account created successfully! Check your email and spam too');

      // Optionally redirect after success
      navigate('/verify-email', { state: { email: formData.email } });

      // Reset form
      setFormData({ username: '', email: '', password: '' });
    } catch (err) {
      console.error(err);
      setServerError(err.message || 'Registration failed');
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit} noValidate>
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-content">
            <p className="form-title">Create an account</p>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Your username
              </label>
              <input
                placeholder="JohnDoe"
                className="form-input"
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="error-text">{errors.username}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                placeholder="example@email.com"
                className="form-input"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                placeholder="••••••••"
                className="form-input"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            {serverError && <p className="error-text">{serverError}</p>}
            {success && <p className="success-text">{success}</p>}

            <button type="submit" className="submit-button">
              Create an account
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
