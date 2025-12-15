import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Profile.css"

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
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchProfile()
    }, [id]);

    if (!currentData) return <p className="p-loading">Cargando perfil...</p>;

    const user = currentData.user;
    return (
        <div className="div-container-profile">
            <h2 className="title-profile">Profile</h2>
            <p className="username-profile">@{user.username}</p>
            <div className="div-container-post-profile">
                <p>Dernier post</p>
                <i className="fa-brands fa-facebook-messenger messenger"></i>
                <p>allPosts</p>
            </div>
            <footer className="footer-profile">

                <i className="fa-solid fa-circle-plus icon-footer" onClick={handleClick("/createPost")}></i>
                <i className="fa-solid fa-message icon-footer" onClick={handleClick("/home")}></i>
            </footer>
        </div>
    )
}