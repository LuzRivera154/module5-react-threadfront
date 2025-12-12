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
        const { User, Post, Commentaires } = sequelize.models;
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

        // Route POST /register : création d'un utilisateur
        app.post('/register', async (request, response) => {
            try {
                const { username, email, password, verifiedPassword } = request.body;
                // Validation : vérifier que tous les champs obligatoires sont présents
                if (!email || !password || !username || !verifiedPassword) {
                    return response.status(400).json({
                        message: "Les champs email, username, password sont requis",
                    });
                }

                if (password !== verifiedPassword) {
                    return response.status(400).json({
                        message: "Les mots de passe ne correspondent pas",
                    });
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

        // Route POST /login : authentification et génération du cookie JWT
        app.post('/login', async (request, response) => {
            try {
                const { email, password } = request.body;
                const user = await User.findOne({ where: { email } });
                const isPasswordSame = bcrypt.compareSync(password, user.password);

                if (!user || !isPasswordSame) {
                    return response.status(401).json({ message: 'Invalid email or password' });
                }
                const token = jwt.sign(
                    { userId: user.id },
                    JWT_SECRET,
                    { expiresIn: '7h' }
                );
                response.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production", // En prod, cookie HTTPS uniquement
                    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                });
                response.json({ message: 'Login succesful' });

            } catch (error) {
                console.error('❌ Erreur lors de la connexion:', error);
                response.status(500).json({ error: 'Erreur serveur' });
            }
        })

        // Middleware d'authentification : toutes les routes suivantes sont protégées
        app.use(isLoggedInJWT(User, JWT_SECRET));

        // Route POST /post : création d'un post pour l'utilisateur connecté
        app.post("/post", async (request, response) => {
            const newPostData = request.body;
            try {
                const newPost = await Post.create({
                    title: newPostData.title,
                    content: newPostData.content,
                    UserId: request.user.id
                });
                return response.json(newPost);
            } catch (error) {
                return response
                    .status(500)
                    .json({ error: "Erreur serveur lors de la création du post" });
            }
        })

        // Route GET /posts : récupération de tous les posts
        app.get("/posts", async (request, response) => {
            try {
                const posts = await Post.findAll();
                if (posts.length === 0) {
                    return response.json({ message: "No posts available at the moment" });
                }
                response.json(posts);
            } catch (error) {
                console.log(error);
                response.status(500).json({ message: "Erreur serveur lors de la récupération des posts" });
            }
        });

        // Route GET /post/:id : récupère un post par id 
        app.get("/posts/:postId", async (request, response) => {
            try {
                const postId = request.params.postId;
                const posts = await Post.findByPk(postId,
                    {
                        include: ["Commentaires"]
                    }
                );
                if (!posts) {
                    return response.status(404).json({ error: "Post non trouvé" });
                };
                return response.json(posts)
            } catch (error) {
                return response.status(500).json({
                    error: "Erreur serveur lors de la récupération du post"
                })
            }
        })

        // Route POST /posts/:postId/commentaire : ajout d'un commentaire à un post
        app.post("/posts/:postId/commentaires", async (request, response) => {
            try {
                const commentairesData = request.body;
                const postsId = request.params.postId;
                const posts = await Post.findByPk(postsId);
                if (!posts) {
                    return response.status(400).json({ error: "Le champ postId est obligatoire" });
                }
                const newCommentaire = await Commentaires.create({
                    content: commentairesData.content,
                    PostId: postsId,
                    UserId: request.userId
                });
                return response.json(newCommentaire);
            } catch (error) {
                return response.status(500).json({ error: "Erreur serveur lors de la création du commentaire" })
            }
        })

        app.get("/users/:userId/posts", async (request, response) => {
            try {
                const posts = await Post.findAll({
                    where: { userId: request.params.userId }
                });
                if (posts.length === 0) {
                    return response.json({ message: "Aucun post publié pour l’instant" });
                }
                response.json(posts);
            } catch (error) {
                response.status(500).json({ error: "Erreur du serveur lors de la récupération des posts" })
            }
        })

        // Route DELETE /comments/:commentId : supprime un commentaire si l'utilisateur est auteur
        app.delete("/commentaires/:commentairesId", async (request, response) => {
            try {
                const commentairesId = request.params.commentairesId;
                const commentaire = await Commentaires.findByPk(commentairesId);
                if (!commentaire) {
                    return response.status(404).json({ error: "Commentaire non trouvé" });
                }
                if (commentaire.UserId != request.user.id) {
                    return response.status(403).json({ error: "Accès refusé" })
                }
                await commentaire.destroy();
                response.json({ message: "Commentaire supprimé avec succès" })
            } catch (error) {
                return response.status(500).json({ error: "Erreur serveur lors de la suppression du commentaire" });
            }
        })

        // Route DELETE /posts/:postId : supprime un post si l'utilisateur est auteur
        app.delete("/posts/:postId", async (request, response) => {
            try {
                const postId = request.params.postId;
                const userId = request.userId

                const post = await Post.findByPk(postId);
                if (!post) {
                    return response.status(404).json({ error: "Post non trouvé" });
                }

                if (post.UserId !== userId) {
                    return response.status(403).json({ error: "Accès refusé" })
                }

                await post.destroy();
                return response.json({ message: "Post supprimé avec succès" })
            } catch (error) {
                return response.status(500).json({ error: "Erreur serveur lors de la suppression du post" });
            }
        })

        // Route GET /logout : supprime le cookie "token" pour déconnecter l'utilisateur
        app.get("/logout", (request, response) => {
            response.clearCookie('token');
            response.json({ message: 'Déconnexion réussie' });
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