import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';  

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
        const response = await fetch('https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Signup failed:', errorData);
            throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response Data:', data);

        if (data.success) {
            alert('Signup successful! Please log in.');
            navigate('/'); 
        } else {
            alert('Signup was not successful');
        }
    } catch (error) {
        if (error instanceof Error) {
            alert(`Signup failed: ${error.message}`);
        } else {
            alert('Signup failed');
        }
    }
};

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="signup-button"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
