import { loadSequelize } from "./database.mjs";
import express, { request, response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        const PORT = process.env.PORT || 3000;
        const sequelize = await loadSequelize();
        const { User, Post, Commentaire } = sequelize.models;
        const JWT_SECRET = process.env.JWT_SECRET;

        function isLoggedInJWT(User) {

            return async (request, response, next) => {

                const token = request.cookies.token;
                if (!token) {
                    return response.status(401).json({ message: 'Unauthorized: No token provided' })
                }
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    request.userId = decoded.userId;
                    request.user = await User.findByPk(request.userId);

                    if (!request.user) {
                        return response.status(401).json({ message: "Accès refusé : utilisateur non trouvé" })
                    }
                    if (!JWT_SECRET) throw new Error("Clé secrète JWT absente");

                    next();
                } catch (error) {
                    return response.status(401).json({ message: 'Unauthorized: Invalid token' })
                }
            }
        }

        const app = express();
        app.use(cors());
        app.use(express.json());
        app.use(cookieParser());

        app.get("/", (request, response) => {
            // J'envoie une string HTML au client via la méthode Response.send()
            response.send("<p>Hello World</p>");
        });

        app.post('/register', async (request, response) => {
            try {
                const { username, email, password, verifiedPassword } = request.body;
                // Validation : vérifier que tous les champs obligatoires sont présents
                if (!email || !password || !verifiedPassword || !username) {
                    return response.status(400).json({
                        message: "Les champs email, username, password et verifiedPassword sont requis",
                    });
                }
                // Validation : vérifier que les deux mots de passe correspondent
                if (password !== verifiedPassword) {
                    return response.status(400).json({ message: "Les mots de passe ne correspondent pas" });
                }
                //Creation
                const user = await User.create({ username, email, password });
                // Response 
                return response
                    .status(201)
                    .json({ message: "Utilisateur créé avec succès", userId: user.id });

            } catch (error) {
                // Gestion des erreurs : email en doublon
                if (error.name === "SequelizeUniqueConstraintError") {
                    return res.status(409).json({ message: "Cet email est déjà utilisé" });
                }
                //Erreur serveur générique
                response.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur" });
            };
        });

        app.listen(PORT, () => {
            console.log(`Serveur démarré sur http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Erreur lors du démarrage de l'application:", error);
    }
}
main()