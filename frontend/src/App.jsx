import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-2xl font-semibold">
      <h1 className="mb-4 text-4xl text-green-600">🍎 FitFood</h1>

      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button
            className="mt-4 bg-red-500 text-white px-3 py-2 rounded"
            onClick={() => supabase.auth.signOut().then(() => setUser(null))}
          >
            Logout
          </button>
        </>
      ) : (
        <a href="/auth" className="text-blue-500 underline">
          Login here
        </a>
      )}
    </div>
  );
}

export default App;
