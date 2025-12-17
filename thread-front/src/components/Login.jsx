import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem("userId", JSON.stringify(data.userId));
        console.log(data.userId)

        setMessage(<p className="message-success-login">Bienvenue ! Vous êtes connecté.</p>);
        setTimeout(() => {
          navigate("/feed");
        }, 1000);
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
      <h1 className="title-conexion">Connexion</h1>

      <form className="form-login" onSubmit={handleSubmit}>

        <input
          className="contact-mail"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          required
        />

        <input
          className="mdp"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="mot de passe"
          required
        />

        <button className="btn-login" type="submit">
          Se connecter
        </button>
      </form>

      <p className="conf">{message}</p>
      <a href="/register" className="register-link">
        Se créer un compte
      </a>
    </div>
  );
}