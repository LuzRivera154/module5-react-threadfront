import { useState } from "react";
import { useNavigate } from "react-router";
import "./CreatePost.css";

export function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState(null); // Ajout d'un état pour gérer les erreurs
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 'credentials: "include"' est crucial pour envoyer le cookie JWT
        credentials: "include",
        body: JSON.stringify({
          // Votre backend attend 'title' et 'content'.
          // Pour l'instant, nous passons null pour title.
          title: null,
          content: content,
        }),
      });
      setError(null); // Réinitialiser les erreurs

      // On s'assure que le contenu n'est pas vide
      if (!content.trim()) {
        setError("Le contenu du post ne peut pas être vide.");
        return;
      }

      if (!response.ok) {
        // Si le serveur retourne une erreur (ex: 401, 500)
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Une erreur est survenue lors de la création du post."
        );
      }

      // La réponse de votre backend pour un nouveau post
      const newPost = await response.json();

      // Appelle la fonction passée en props pour potentiellement mettre à jour l'UI
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Vide le textarea après le succès de l'envoi
      setContent("");
    } catch (err) {
      console.error("Erreur lors de la soumission du post:", err);
      setError(err.message);
    }
  };
  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <h1 className="post-title">New Post</h1>
      {error && <p className="error-message">{error}</p>}
      <textarea
        className="post-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tape ton texte ici..."
      />
      <button className="post-button" type="submit">
        Poster !
      </button>
      <div className="icons-container">
        <i className="fa-solid fa-circle-user" onClick={() => navigate('/profile')}></i>
        <i className="fa-regular fa-message" onClick={() => navigate('/feed')}></i>
      </div>
    </form>
  );
}
