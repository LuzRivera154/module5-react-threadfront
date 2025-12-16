import { useNavigate } from "react-router-dom";

export function BtnLogout() {
    const navigate = useNavigate()
    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/logout", {
                credentials: "include",
            });
            navigate("/login");
        } catch (err) {
            console.error("Erreur lors de la déconnexion:", err);
        }
    }
    return (
        <div className="div-container-btn-logout">
                <i class="fa-solid fa-right-from-bracket exit" onClick={handleLogout}></i>
        </div>
    )

}

