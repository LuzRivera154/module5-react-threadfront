import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateDisplay } from "./DateDisplay";
import "./Feed.css";

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log(storedUserId);

    if (storedUserId) {
      setUser(Number(storedUserId));
    }
  }, []);



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
    <div className="feed-container">
      <header>
        <h1 className="feed-title">Feed</h1>
      </header>

      <div>
        {posts.length === 0 ? (
          <p>Aucun post pour le moment</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => handlePostClick(post.id)}
            >
              <div>
                <span className="feed-author">@{post.User?.username || "Anonyme"}</span>
                <h3 className="post-feed">{post.title || "Sans titre"}</h3>
                <p className="feed-contents">{post.content}</p>
                <span className="feed-date">
                  <DateDisplay date={post.createdAt} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="icons-postdetail">
        <i className="fa-solid fa-circle-plus" style={{ color: '#ffffff' }} onClick={() => navigate('/createPost')}  ></i>
        <i className="fa-solid fa-circle-user" onClick={() => navigate(`/profile/${user}`)}></i>
      </div>
    </div>
  );
}