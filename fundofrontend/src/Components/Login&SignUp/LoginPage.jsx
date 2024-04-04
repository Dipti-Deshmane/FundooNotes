import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import base_url from '../../Services/helper';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../Css/LoginPage.css';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!isValidEmail(loginData.email)) {
      toast.error('Invalid email format', { position: 'top-center' });
      return;
    }

    if (!isValidPassword(loginData.password)) {
      toast.error('Invalid password format or length', { position: 'top-center' });
      return;
    }

    try {
      const response = await axios.post(`${base_url}/auth/signin`, loginData);
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login Successful', { position: 'top-center' });
        navigate('/NoteDashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid Credentials. Please try again later', { position: 'top-center' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const isValidEmail = (email) => {
    // Regular expression for basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidPassword = (password) => {
    // Check if password length is at least 8 characters
    return password.length >= 8;
  };
  

  return (
    <div className="login-container">
      <form className="form-box">
        <h1 className="header-text" style={{ marginLeft: 150 }}>Login</h1>
        <div className="email">
          <input
            type="text"
            className='inputlogin'
            id="email"
            name="email"
            placeholder="UserName"
            value={loginData.email}required
            onChange={handleChange}
            
          />
        </div>
        <div className="password">
          <input
            type="password"
            id="password"
            className='inputlogin'
            name="password"
            placeholder="Password"
            value={loginData.password}
            required
            onChange={handleChange}
            
          />
        </div>
        <div>
          <a style={{ marginLeft: 90, color: 'white' }} href="/Signup-page">
            Don't have an account? Sign up
          </a>
        </div>
        <button className='loginbutton' type="submit" onClick={handleSubmit}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
