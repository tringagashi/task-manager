import React, { useState } from "react";
import axios from "axios";

function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      alert("User registered successfully!");
    } catch (err) {
      alert("Registration failed");
      console.log(err.response?.data);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      window.location.reload();
    } catch (err) {
      alert("Invalid credentials");
      console.log(err.response?.data);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Login / Register</h2>

      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: "block", margin: "5px auto", padding: "10px" }}
      />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", margin: "5px auto", padding: "10px" }}
      />

      <button onClick={handleRegister} style={{ marginRight: "10px" }}>
        Register
      </button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Auth;
