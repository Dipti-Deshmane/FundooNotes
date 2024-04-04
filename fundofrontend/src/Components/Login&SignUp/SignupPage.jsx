import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './../Css/SignUpPage.css';
import base_url from "../../Services/helper";
import axios from 'axios';

const SignUpPage = () => {
    const [signupData, setSignupData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        password: "",
        confirmpassword: ""
    });

    const validateEmail = (email) => {
        // Email validation logic here (e.g., check for @ and domain at the end)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePassword = (password) => {
        // Password validation logic here (e.g., at least one digit, one lowercase character, one uppercase character, one special character, no whitespace, and at least 8 characters)
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(password);
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await axios.get(`${base_url}/auth/checkEmailExists?email=${email}`);
            return response.data.exists;
        } catch (error) {
            console.error("Error checking email existence:", error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate form data
        if (signupData.firstName.trim() === '' || signupData.lastName.trim() === '') {
            toast.error("Please enter your first and last name.", { position: 'top-center',});
            return;
        }
        if (!validateEmail(signupData.email)) {
            toast.error("Please enter a valid email address.", { position: 'top-center' });
            return;
        }
        if (!validatePassword(signupData.password)) {
            toast.error("Please enter a valid password!", { position: 'top-center' });
            return;
        }
        if (signupData.password !== signupData.confirmpassword) {
            toast.error("Confirm password does not match. Please enter the same password in both fields.", { position: 'top-center' });
            return;
        }
        if (signupData.confirmpassword.trim() === '') {
            toast.error("Please enter confirm password.", { position: 'top-center' });
            return;
        }
      

        // Check if email already exists
        const emailExists = await checkEmailExists(signupData.email);
        if (emailExists) {
            toast.warn("Email already exists. Please use a different email address.", { position: 'top-center' });
            return;
        }

        try {
            const response = await axios.post(`${base_url}/auth/signup`, signupData);
            console.log(response.data);
            const token = response.data.token;
            localStorage.setItem('token', token);
            toast.success("Verification link sent. Kindly check your email!", { position: "top-center" });
        } catch (error) {
            if (error.response) {
                // Handle specific error responses from the server
            } else if (error.request) {
                // Handle request-related errors
            } else {
                // Handle other errors
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupData({ ...signupData, [name]: value });
    };

    return (
        <div className="signup-container">
            <form className="signupform-box">

                <h1 className="header-text">Sign Up</h1>

                <div className="fullname">
                    <input type="text" style={{ width: 150, marginRight: 20 }} id="firstName" className='inputSignup'
                        name="firstName" placeholder="FirstName" value={signupData.firstName}
                        onChange={handleChange}
                        required />

                    <input type="text" style={{ width: 150 }} id="lastName" className='inputSignup'
                        name="lastName" placeholder="LastName" value={signupData.lastName}
                        onChange={handleChange}
                        required />
                </div>

                <div className="dateOfBirth">
                    <input type="date" id="dateOfBirth" style={{ fontFamily: "calibri", textTransform: "uppercase" }} className='inputSignup'
                        name="dateOfBirth" placeholder="Date Of Birth" value={signupData.dateOfBirth}
                        onChange={handleChange}
                        required />
                </div>

                <div className="email">
                    <input type="text" id="email" className='inputSignup'
                        name="email" placeholder="Email" value={signupData.email}
                        onChange={handleChange}
                        required />
                </div>
                <div className="password">
                    <input type="password" id="password" className='inputSignup'
                        name="password" placeholder="Password" value={signupData.password}
                        onChange={handleChange}
                        required />
                </div>
                <div className="cnfpassword">
                    <input type="password" id="confirmpassword" className='inputSignup'
                        name="confirmpassword" placeholder="Confirm Password" value={signupData.confirmpassword}
                        onChange={handleChange}
                        required />
                </div>

                <div>
                    <a style={{ marginLeft: 70, color: "white" }} href="/">Already have an account? Login</a>
                </div>
                <button className="signupbutton" type="submit" onClick={handleSubmit}>Sign Up</button>

            </form>


        </div>
    );
}

export default SignUpPage;
