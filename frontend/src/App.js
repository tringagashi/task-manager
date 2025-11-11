import React from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div>
      {token ? <Dashboard /> : <Auth />}
    </div>
  );
}

export default App;
