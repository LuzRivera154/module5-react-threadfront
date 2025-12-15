import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import "./PostDetails.css";

export function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Post non trouvé");
      }
      
      const data = await response.json();
      setPost(data);
      setComments(data.Commentaires || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:3000/posts/${postId}/commentaires`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            content: newComment,
          }),
        }
      );

      if (response.ok) {
        const createdComment = await response.json();
        setComments([...comments, createdComment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;

    try {
      const response = await fetch(
        `http://localhost:3000/commentaires/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Supprimer ce post ?")) return;

    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du post:", err);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!post) return <div>Post non trouvé</div>;

  return (
    <div className="post-details-container">
      <header className="post-details-header">
        <button className="back-button" onClick={() => navigate("/home")}>
          ← Retour
        </button>
        <button className="delete-post-button" onClick={handleDeletePost}>
          Supprimer le post
        </button>
      </header>

      <div className="post-main">
        <h1 className="post-details-title">{post.title || "Sans titre"}</h1>
        <p className="post-details-content">{post.content}</p>
        <div className="post-meta">
          <span className="post-author">@{post.User?.username || "Anonyme"}</span>
          <span className="post-date">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">Commentaires ({comments.length})</h3>
        
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <textarea
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            rows="3"
          />
          <button type="submit" className="comment-submit-button">
            Commenter
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">Aucun commentaire</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">
                    @{comment.User?.username || "Anonyme"}
                  </span>
                  <button
                    className="delete-comment-button"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    ×
                  </button>
                </div>
                <p className="comment-content">{comment.content}</p>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}