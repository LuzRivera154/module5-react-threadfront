import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateDisplay } from "./DateDisplay";
import "./PostDetails.css";

export function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log(localStorage.getItem("userId"));

   if(storedUserId){
    setUserId(Number(storedUserId))
   }
  }, [])

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
        setComments([createdComment, ...comments]); // com a la fin
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
        navigate("/feed");
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

      <h1 className="titlePost">Post</h1>
      <div className="post-main">
        <div className="deletepost">
          <button
            className="delete-post-button"
            onClick={() => handleDeletePost(post.id)}
          >
            ×
          </button>
        </div>

        <span className="post-author">@{post.User?.username || "Anonyme"}</span>
        <p className="post-details-title">{post.title || "Sans titre"}</p>
        <p className="post-details-content">{post.content}</p>
        <div className="post-meta">
          <span className="post-date">
            <DateDisplay date={post.createdAt} />
          </span>
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">
          {comments.length}
          <i className="fa-solid fa-message" style={{ color: "#ffffff" }}></i>{" "}
        </h3>

        <div className="comments-list">
          {comments.length === 0 ? (
            <>
              <p className="no-comments">Aucun commentaire</p>
              <form className="comment-form" onSubmit={handleSubmitComment}>
                <textarea
                  className="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tapez votre commentaire ici.."
                  rows="2"
                />
                <button type="submit" className="comment-submit-button">
                  <i className="fa-solid fa-check"></i>
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Commentaire le plus récent */}
              <div key={comments[0].id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">
                    @{comments[0].User?.username || "Anonyme"}
                  </span>
                  <button
                    className="delete-comment-button"
                    onClick={() => handleDeleteComment(comments[0].id)}
                  >
                    ×
                  </button>
                </div>
                <p className="comment-content">{comments[0].content}</p>
                <span className="comment-date">
                  <DateDisplay date={comments[0].createdAt} />
                </span>
              </div>

              {/* Zone de saisie juste sous le commentaire récent */}
              <form className="comment-form" onSubmit={handleSubmitComment}>
                <textarea
                  className="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tapez votre commentaire ici.."
                  rows="2"
                />
                <button type="submit" className="comment-submit-button">
                  <i className="fa-solid fa-check"></i>
                </button>
              </form>

              {/* Autres commentaires plus anciens */}
              {comments.slice(1).map((comment) => (
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
                    <DateDisplay date={comment.createdAt} />
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="icons-postdetail">
          <i className="fa-solid fa-circle-plus" style={{ color: '#ffffff' }} onClick={() => navigate('/createPost')}  ></i>
          <i className="fa-solid fa-circle-user" onClick={() => navigate(`/profile/${post.User.id}`)}></i>
          <i className="fa-solid fa-message" style={{ color: '#ffffff' }} onClick={() => navigate('/feed')}></i>
        </div>
      </div>
    </div>
  );
}
