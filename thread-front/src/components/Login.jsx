import { useState } from "react";
import "./Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Champs obligatoires!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <- importante para recibir la cookie HTTP-only
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage("Bienvenue ! Vous êtes connecté.");
      } else {
        setMessage(data.message || "Erreur de connexion");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur");
    }
  };


  return (

    <div className="login-container">
      <h1 >Connexion</h1>


      <form onSubmit={handleSubmit} >
        <div >


          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            required
          />
        </div>

        <div >

          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mot de passe"
            required
          />
        </div>

        <button type="submit" >Se connecter</button>

        <p>{message}</p>

        <a href="/register" className="register-link">Se créer un compte</a>
      </form>
    </div>
  );
}
