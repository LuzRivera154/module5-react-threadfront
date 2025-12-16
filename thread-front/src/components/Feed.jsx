import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import "./Home.css";

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/posts", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des posts");
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/logout", {
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Thread</h1>
        <button className="logout-button" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>

      <div className="posts-container">
        {posts.length === 0 ? (
          <p className="no-posts">Aucun post pour le moment</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="post-header">
                <h3 className="post-title">{post.title || "Sans titre"}</h3>
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="post-content">{post.content}</p>
              <div className="post-footer">
                <span className="comments-count">
                  <i className="fa-regular fa-comment"></i>
                  {post.Commentaires?.length || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="new-post-button"
        onClick={() => navigate("/createPost")}
      >
        <i className="fa-solid fa-plus"></i> Nouveau post
      </button>
    </div>
  );
}