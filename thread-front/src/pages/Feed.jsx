import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateDisplay } from "../components/DateDisplay";
import InfiniteScroll from "react-infinite-scroll-component";
import "../css/Feed.css";

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log(storedUserId);

    if (storedUserId) {
      setUser(Number(storedUserId));
    }
  }, []);

  useEffect(() => {
    console.log("Effect page")
    fetchPosts();

  }, [page])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/posts?page=${page}&limit=10`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des posts");
      }

      const data = await response.json();

      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);

    } catch (err) {
      setError(err.message);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Supprimer ce post ?")) return;
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du post:", err);
    }
  };

  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="feed-container">
      <header>
        <h1 className="feed-title">Feed</h1>
      </header>


      <InfiniteScroll
        dataLength={posts.length}
        next={() => setPage(prev => prev + 1)}
        hasMore={hasMore}
        loader={<h4 className="text-align">Chargement...</h4>}
        endMessage={<p className="text-align">final</p>}
        height={700}
      >
        <div >
          {posts.length === 0 ? (
            <p >Aucun post pour le moment</p>
          ) : (
            posts.map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                className="post-card"
              >
                <div>
                  <div className="content-title-btn-feed">
                    <span className="feed-author">@{post.User?.username || "Anonyme"}</span>
                    <button className="delete-post-btn" onClick={() => handleDeletePost(post.id)} >
                      <i class="fa-solid fa-xmark delete-icon"></i>
                    </button>
                  </div>
                  <h3 onClick={() => handlePostClick(post.id)} className="post-feed">{post.title || "Sans titre"}  </h3>
                  <p className="feed-contents">{post.content}</p>
                  <span className="feed-date">
                    <DateDisplay date={post.createdAt} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </InfiniteScroll>

      <div className="icons-postdetail">
        <i className="fa-solid fa-circle-plus" style={{ color: '#ffffff' }} onClick={() => navigate('/createPost')}  ></i>
        <i className="fa-solid fa-circle-user" onClick={() => navigate(`/profile/${user}`)}></i>
      </div>
    </div >
  );
}