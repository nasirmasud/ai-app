import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <>
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
        <h1>Hello from client</h1>
        <p className='font-bold p-4 text-3xl'>{message}</p>
        <Button variant='outline'>Click Me</Button>
      </div>
    </>
  );
}

export default App;
