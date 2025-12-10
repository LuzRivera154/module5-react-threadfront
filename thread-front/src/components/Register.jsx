import { useEffect, useState } from "react";
import "./Register.css"

export function Register(){
    const [username,setUsername] = useState ("");
    const [email,setEmail] = useState ("");
    const [password,setPassword] = useState ("");
    const [verifiedPassword,setVerifiedPassword] = useState ("");
    const [message,setMessage] = useState ("")


     useEffect(() => {
     fetch("http://localhost:3000/login")
    .then((response) => response.json())
    .then((data) => {
      console.log("Données reçues :", data); 

     // Par exemple mettre à jour un autre state :
     setMessage(data.message);
    })
    .catch((error) => console.error(error));
}, []);

    const handleSubmit = (event) => {
    event.preventDefault();


    setMessage (`${username} enregistré avec succès`)

    setUsername ("");
    setEmail ("");
    setPassword("");
    setVerifiedPassword("")
   }

  

    return (
  <div className="container-register">
    <h2>Creation de <br />
    compte</h2>
    <br />

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
        <button type = "submit"> Créer un <br /> compte</button>
        <p>{message}</p>
        
    </form>
  </div>
)}
