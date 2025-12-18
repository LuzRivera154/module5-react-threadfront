
import "./Post.css"
import { useNavigate } from "react-router-dom";
import { DateDisplay } from "./DateDisplay";
///posts/:postId

export function Post({ post }) {
    const navigate = useNavigate();

    const handleDeletePost = async () => {
        if (!window.confirm("Supprimer ce post ?")) return;
        try {
            const response = await fetch(`http://localhost:3000/posts/${post.id}`, {
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
    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };


    if (!post) return <div>Post non trouvé</div>;
    return (
        <div className="div-container-post" onClick={() => handlePostClick(post.id)}>
            <div className="div-container-subtitle-post">
                <p className="post-publie">Post publié par :
                    <span className="btn-profile-post" onClick={() => navigate(`/profile/${post.User.id}`)}>
                        @{post.User.username}
                    </span>
                </p>
                <button className="delete-post-btn" onClick={handleDeletePost}>
                    <i class="fa-solid fa-xmark delete-icon"></i>
                </button>
            </div>
            <div>
                <h4 className="h4-title-post">{post.title}</h4>
                <p className="p-content-post">{post.content}</p>
            </div>
            <span className='date-display-post'>
                
            <DateDisplay  date={post.createdAt} />
            </span>
        </div>
    )
}