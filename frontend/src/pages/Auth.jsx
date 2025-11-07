import { useState } from "react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    let result;
    if (isLogin)
      result = await supabase.auth.signInWithPassword({ email, password });
    else result = await supabase.auth.signUp({ email, password });

    if (result.error) setMessage(result.error.message);
    else setMessage(isLogin ? "Logged in ✅" : "Signup successful ✅");
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <h1 className='text-3xl font-bold mb-4'>
        🍎 FitFood {isLogin ? "Login" : "Signup"}
      </h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-2 w-72'>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='p-2 border rounded'
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='p-2 border rounded'
        />
        <button className='bg-green-600 text-white py-2 rounded mt-2'>
          {isLogin ? "Login" : "Sign up"}
        </button>
      </form>

      <p
        className='mt-4 text-blue-500 cursor-pointer'
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Create an account" : "Already have an account? Login"}
      </p>

      {message && <p className='mt-3 text-sm text-gray-700'>{message}</p>}
    </div>
  );
}
