import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api'; // Adjust path as needed

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: '' });
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const data = await api.login(formData);
      // Save token or any other needed data
      localStorage.setItem('token', data.token); // or data.accessToken etc.
      console.log("Login successful")
      navigate('/dashboard'); // Redirect to dashboard or wherever
    } catch (error) {
      setServerError(error.message || 'Login failed');
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-content">
            <p className="form-title">Login to your account</p>

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
              {errors.email && <p className="error-text">{errors.email}</p>}
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
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <p class="signup-link">
        No account?
        <a href="/register">Sign up</a>
      </p>

            {serverError && <p className="error-text">{serverError}</p>}

            <button type="submit" className="submit-button">
              Login
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
