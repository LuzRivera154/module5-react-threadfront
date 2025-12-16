import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Profile.css"
import { Post } from "./Post";
import { BtnLogout } from "./BtnLogout";

export function Profile() {
    const { id } = useParams();
    const [currentData, setData] = useState(null)
    const navigate = useNavigate();

    const handleClick = (path) => () => {
        navigate(path);
    };
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:3000/users/${id}/profile`, {
                    credentials: 'include',
                }
                );
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchProfile()
    }, [id]);

    if (!currentData) return <p>Cargando perfil...</p>;
    const user = currentData.user;
    const posts = currentData.posts;

    const lastPost = [...posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    return (
        <div className="div-container-profile">
            <div className="div-container-title-btn-profile">
            <h2 className="title-profile"><i className="line">|</i>Profile</h2>
            <BtnLogout />
            </div>
            <p className="username-profile">@{user.username}</p>

            <div className="last-post-container">
                {lastPost && <Post post={lastPost} />}  </div>

            <div className="container-icon-count">
                <span className="number-span-profile"> {posts.length} </span>
                <i className="fa-brands fa-facebook-messenger messenger"></i>
            </div>
            <div className="div-container-post-profile">
                {
                    posts.length === 0 ? (
                        <p className="no-posts">Aucun post pour le moment</p>
                    ) : (

                        posts.map((post) => {
                            return <Post key={post.id} post={post} />;
                        }))}

            </div>
            <footer className="footer-profile">
                <div className="div-footer-profile">
                    <i className="fa-solid fa-circle-plus icon-footer" onClick={handleClick("/createPost")}></i>
                    <i className="fa-solid fa-message icon-footer" onClick={handleClick("/feed")}></i>
                </div>
            </footer>
        </div>
    )
}