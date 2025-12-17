import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateDisplay } from "./DateDisplay.jsx";
import "./CreatePost.css";

export function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const post = { createdAt: new Date().toISOString() };
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log(localStorage.getItem("userId"));

   if(storedUserId){
    setUserId(Number(storedUserId))
   }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Le contenu du post ne peut pas être vide.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim() || "Sans titre",
          content: content.trim(),
        }),
      });

      // Réinitialiser les messages
      setError(null);

      if (!response.ok) {
        // Si le serveur retourne une erreur
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Erreur lors de la création du post."
        );
      }

      // La réponse de votre backend pour un nouveau post
      const newPost = await response.json();

      // Appelle la fonction passée en props pour potentiellement mettre à jour l'UI
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Message de succès
      setSuccessMessage("Post créé avec succès !");

      // Vide les champs après le succès de l'envoi
      setTitle("");
      setContent("");

      // Redirection vers la page d'accueil après 1.5 secondes
      setTimeout(() => {
        navigate("/feed");
      }, 1500);

    } catch (err) {
      console.error("Erreur lors de la soumission du post:", err);
      setError(err.message);
    }
  };


  return (
    <form className="create-post" onSubmit={handleSubmit} style={{ position: 'relative', minHeight: '100vh' }}>
      <h1 className="post-title">New Post</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="post-content-wrapper">
        <textarea
          className="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tapez votre post ici ..."
        />
        <div className="date-preview">
          <DateDisplay date={post.createdAt} />
        </div>
      </div>
      <button className="post-button" type="submit">
        Poster !
      </button>
      <div className="icons-container">
        <i className="fa-solid fa-circle-user" onClick={() => navigate(`/profile/${userId}`)}></i>
        <i className="fa-regular fa-message" onClick={() => navigate('/feed')}></i>
      </div>
    </form>
  );
}