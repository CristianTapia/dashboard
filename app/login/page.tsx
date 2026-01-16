"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/app/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else router.push("/dashboard");
  }

  async function handleRegister() {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Registro OK (revisa email si esta activo)");
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Iniciar sesion</h1>
      <label style={{ display: "block", marginBottom: 8 }}>
        Email
        <input
          style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label style={{ display: "block", marginBottom: 16 }}>
        Password
        <input
          style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}
