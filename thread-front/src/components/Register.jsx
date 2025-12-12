import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifiedPassword, setVerifiedPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, verifiedPassword })
            });

            const data = await res.json();
            console.log("Réponse backend :", data);

            setMessage(data.message || "Une erreur est survenue");

            // redirection
            if (data.success) {
                setIsSuccess(true);

                setUsername("");
                setEmail("");
                setPassword("");
                setVerifiedPassword("");

                // Redirection après 1 seconde
                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            } else {
                setIsSuccess(false);
            }

        } catch (error) {
            console.error("Erreur fetch :", error);
            setMessage("Erreur réseau ou serveur indisponible");
            setIsSuccess(false);
        }
    };

    return (
        <div className="container-register">
            <h2 className="create">Création de compte</h2>

            <form className="formulaire" onSubmit={handleSubmit}>

                <input
                    className="inputP"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@Pseudo"
                    required
                />

                <input
                    className="inputP"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    required
                />

                <input
                    className="inputP"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="mot de passe"
                    required
                />

                <input
                    className="inputP"
                    type="password"
                    value={verifiedPassword}
                    onChange={(e) => setVerifiedPassword(e.target.value)}
                    placeholder="mot de passe encore"
                    required
                />

                <button className="buttonSub" type="submit">
                    Créer un compte
                </button>

                {message && (
                    <p className={isSuccess ? "success" : "error"}>{message}</p>
                )}

            </form>
        </div>
    );
}
