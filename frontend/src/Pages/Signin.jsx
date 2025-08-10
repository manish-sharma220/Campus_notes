

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { loading, error, currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use state to track if navigation has occurred
  const [hasNavigated, setHasNavigated] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(signInStart());

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/signin",
        formData,
        { withCredentials: true }
      );

      const data = response.data;
      console.log("Login response:", data);

      dispatch(signInSuccess(data.user)); // Successfully signed in
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage = error.response?.data?.message || "Failed to sign in";
      dispatch(signInFailure(errorMessage));
    }
  };

  // Separate useEffect to handle only the first navigation

  useEffect(() => {
    if (currentUser && !hasNavigated) {
      const userRole = currentUser.role || currentUser.user?.role;
  
      setHasNavigated(true);
  
      if (userRole === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    }
  }, [currentUser, hasNavigated, navigate]);
  

  // Handling form submission and loading state
  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while signing in
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          id="email"
          className="border p-3 rounded-lg"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="border p-3 rounded-lg"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Don't have an account?</p>
        <Link to="/sign-up">
          <span className="text-blue-700">Sign up</span>
        </Link>
      </div>
      {error && <p className="text-red-600 text-center mt-5">{error}</p>}

      {/* Debug Info (optional for dev) */}
      {import.meta.env.MODE !== "production" && currentUser && (
        <div className="mt-5 p-3 bg-gray-100 rounded text-sm">
          <p className="font-bold">Debug Info:</p>
          <pre>{JSON.stringify(currentUser, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SignIn;
