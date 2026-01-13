"use client";

import { useState } from "react";
import { supabaseClient } from "@/app/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Login OK");
  }

  async function handleRegister() {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Registro OK (revisa email si está activo)");
  }

  return (
    // Login and Registration Form
    <div style={{ padding: 20 }}>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
