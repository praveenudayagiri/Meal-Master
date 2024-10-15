import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import './css/Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [gmail, setGmail] = useState("narayana@gmail.com");
  const [password, setPassword] = useState("Narayana@123");
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(BASE_URL + "/login", {
        gmail,
        password,
      }, { withCredentials: true });
  
      // Log the response to check the structure
      console.log("Response:", res);
  
      // Store user data in Redux only if res.data exists
      if (res && res.data) {
        dispatch(addUser(res.data));
        // Navigate to the home page after successful login
        navigate("/");
      } else {
        setError("Login failed. No data received.");
      }
    } catch (error) {
      // Fallback for error responses without proper structure
      const errorMessage = error.response && error.response.data ? error.response.data : "An unknown error occurred.";
      setError(errorMessage);
      console.error("Login error:", error);
    }
  };
  

  return (
    <main className="login-page">
      <div className="login_container">
<div className='login_flex'>
<h1 style={{ textAlign: "center", marginTop: "20px", cursor: "pointer" }} onClick={() => navigate('/login')}>
          LOGIN
        </h1>
        <h1 style={{ textAlign: "center", marginTop: "20px", cursor: "pointer" }} onClick={() => navigate('/signup')}>
          /SIGNUP
        </h1>
</div>
        <label htmlFor="useremail">Gmail:</label><br />
        <input type="text" value={gmail} id="useremail" onChange={(e) => setGmail(e.target.value)} /><br />
        <label htmlFor="userpassword">Password</label><br />
        <input type="password" value={password} id="userpassword" onChange={(e) => setPassword(e.target.value)} /><br />
        <p id="error_message">{error}</p>
        <button id="input_submit" type="button" onClick={handleLogin}>SUBMIT</button>
      </div>
    </main>
  );
};

export default Login;
