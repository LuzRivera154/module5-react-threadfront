import { useState } from "react";
import "./Register.css"

export function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifiedPassword, setVerifiedPassword] = useState("");
    const [message, setMessage] = useState("")




    const handleSubmit = (event) => {
        event.preventDefault();

        fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, verifiedPassword })
        })
            .then(res => res.json())
            .then(data => setMessage(data.message))
            .catch(err => console.error(err));


        setMessage(`${username} enregistré avec succès`)

        setUsername("");
        setEmail("");
        setPassword("");
        setVerifiedPassword("")

        
    }
    

    return (
        <div className="container-register">
            <h2>Creation de 
                compte</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@Pseudo"
                    />
                </div>

                <br />

                <div>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                    />
                </div>

                <br />

                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="mot de passe"
                    />
                </div>

                <br />

                <div>
                    <input
                        type="password"
                        value={verifiedPassword}
                        onChange={(e) => setVerifiedPassword(e.target.value)}
                        placeholder="mot de passe encore"
                    />
                </div>
                <button type="submit"> Créer un <br /> compte</button>
                {message && <p>{message}</p>}

            </form>
        </div>
    )
}
