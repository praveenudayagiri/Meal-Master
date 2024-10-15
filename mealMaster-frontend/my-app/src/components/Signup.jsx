import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import './css/Signup.css'; // Ensure this CSS file is created and linked

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      const res = await axios.post(BASE_URL + "/signup", {
        name,
        gmail,
        password,
      }, { withCredentials: true });

      // Store user data in Redux
      dispatch(addUser(res.data));

      // Navigate to the home page after successful signup
      navigate("/");
    } catch (error) {
      setError(error.response.data);
      console.log(error);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup_container">
      <div className='login_flex'>
<h1 style={{ textAlign: "center", marginTop: "20px", cursor: "pointer" }} onClick={() => navigate('/login')}>
          LOGIN
        </h1>
        <h1 style={{ textAlign: "center", marginTop: "20px", cursor: "pointer" }} onClick={() => navigate('/signup')}>
          /SIGNUP
        </h1>
</div>
        <label htmlFor="username">Name:</label><br />
        <input type="text" value={name} id="username" onChange={(e) => setName(e.target.value)} /><br />
        <label htmlFor="useremail">Gmail:</label><br />
        <input type="text" value={gmail} id="useremail" onChange={(e) => setGmail(e.target.value)} /><br />
        <label htmlFor="userpassword">Password</label><br />
        <input type="password" value={password} id="userpassword" onChange={(e) => setPassword(e.target.value)} /><br />
        <p id="error_message">{error}</p>
        <button id="input_submit" type="button" onClick={handleSignup}>SUBMIT</button>
      </div>
    </main>
  );
};

export default Signup;
