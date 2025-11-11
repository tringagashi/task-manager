import React from "react";

function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h1>Welcome to Dashboard ✅</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
