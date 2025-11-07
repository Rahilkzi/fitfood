import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.text())
      .then(setMessage)
      .catch(() => setMessage("Backend not running yet 🚧"));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-2xl font-semibold bg-gray-100">
      <h1 className="mb-4 text-4xl text-green-600">🍎 FitFood</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
