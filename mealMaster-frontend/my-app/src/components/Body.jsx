import { useNavigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect, useState } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
      try {
          const res = await axios.post(`${BASE_URL}/profile`, {}, { withCredentials: true });
          dispatch(addUser(res.data));
      } catch (error) {
          navigate("/login");
          console.log("Error fetching user profile:", error);
      } finally {
          setLoading(false); // Set loading to false once fetching is done
      }
  };

  useEffect(() => {
      fetchUser();
  }, []);

  if (loading) {
      return <div>Loading...</div>; // Show loading indicator
  }

  return (
      <div>
          <Navbar />
          <Outlet />
      </div>
  );
};

export default Body;
