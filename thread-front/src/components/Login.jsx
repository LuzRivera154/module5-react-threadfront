import { useState } from "react";
import "./Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Champs obligatoires!");
      return;
    }

    // Simulation d'une connexion réussie
    setMessage(`Bienvenue ! Vous êtes connecté.`);

    setEmail("");
    setPassword("");
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
