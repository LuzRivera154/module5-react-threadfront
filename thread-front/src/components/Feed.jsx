import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateDisplay } from "./DateDisplay";
import InfiniteScroll from "react-infinite-scroll-component";
import "./Feed.css";

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

  useEffect(()=>{
    console.log("Effect page")
    fetchPosts();

  },[page])

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


  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="feed-container">
      <header>
        <h1 className="feed-title">Feed</h1>
      </header>


      <InfiniteScroll
        dataLength={posts.length} // poner una funcion que cuente cuantos posts hay
        next={()=>setPage(prev => prev + 1)}
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
      </InfiniteScroll>

      <div className="icons-postdetail">
        <i className="fa-solid fa-circle-plus" style={{ color: '#ffffff' }} onClick={() => navigate('/createPost')}  ></i>
        <i className="fa-solid fa-circle-user" onClick={() => navigate(`/profile/${user}`)}></i>
      </div>
    </div >
  );
}