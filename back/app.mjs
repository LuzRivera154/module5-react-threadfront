import { loadSequelize } from "./database.mjs";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    const PORT = process.env.PORT || 3000;
    const sequelize = await loadSequelize();
    const { User, Post, Commentaires } = sequelize.models;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("ERREUR: JWT_SECRET n'est pas défini dans .env");
      process.exit(1);
    }

    function isLoggedInJWT() {
      return async (request, response, next) => {
        const token = request.cookies.token;
        if (!token) {
          return response
            .status(401)
            .json({ message: "Non autorisé : Aucun token fourni" });
        }
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          request.userId = decoded.userId;
          request.user = await User.findByPk(request.userId);

          if (!request.user) {
            return response
              .status(401)
              .json({ message: "Accès refusé : utilisateur non trouvé" });
          }
          
          next();
        } catch (error) {
          console.error("Erreur token JWT:", error.message);
          return response
            .status(401)
            .json({ message: "Non autorisé : Token invalide ou expiré" });
        }
      };
    }

    const app = express();
    
    // Configuration CORS
    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    
    app.use(express.json());
    app.use(cookieParser());

    app.get("/", (request, response) => {
      response.send("<p>API Thread - Backend</p>");
    });

    // Route GET /debug/users : pour déboguer (à supprimer en prod)
    app.get("/debug/users", async (request, response) => {
      try {
        const users = await User.findAll({
          attributes: ['id', 'username', 'email', 'createdAt']
        });
        response.json(users);
      } catch (error) {
        response.status(500).json({ error: error.message });
      }
    });

    // Route POST /register : création d'un utilisateur
    app.post("/register", async (request, response) => {
      try {
        const { username, email, password, verifiedPassword } = request.body;

        console.log(" Tentative d'inscription:", { username, email });

        // Vérification des champs obligatoires
        if (!email || !password || !username || !verifiedPassword) {
          return response.status(400).json({
            success: false,
            message: "Tous les champs sont requis",
          });
        }

        // Vérification de la correspondance des mots de passe
        if (password !== verifiedPassword) {
          return response.status(400).json({
            success: false,
            message: "Les mots de passe ne correspondent pas",
          });
        }

        // Vérification si l'email existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return response.status(409).json({
            success: false,
            message: "Cet email est déjà utilisé",
          });
        }

        // Vérification si le username existe déjà
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
          return response.status(409).json({
            success: false,
            message: "Ce nom d'utilisateur est déjà pris",
          });
        }

        // Création de l'utilisateur (le modèle se charge du hash automatiquement)
        const user = await User.create({
          username,
          email,
          password: password, // Mot de passe en clair, le modèle le hash
        });
        
        console.log("Utilisateur créé:", user.id, user.username);

        // Réponse succès
        return response.status(201).json({
          success: true,
          message: "Utilisateur créé avec succès",
          userId: user.id,
          username: user.username,
        });
        
      } catch (error) {
        console.error("ERREUR /register :", error.message);
        console.error("Détails:", error);
        return response.status(500).json({
          success: false,
          message: `Erreur serveur: ${error.message}`,
        });
      }
    });

    // Route POST /login : authentification et génération du cookie JWT
    app.post("/login", async (request, response) => {
      try {
        const { email, password } = request.body;
        
        console.log("Tentative de login pour:", email);

        // 1. Vérifier que les champs sont fournis
        if (!email || !password) {
          return response.status(400).json({
            message: "Email et mot de passe requis",
          });
        }

        // 2. Chercher l'utilisateur
        const user = await User.findOne({ where: { email } });

        // 3. Si utilisateur non trouvé → erreur
        if (!user) {
          console.log("Utilisateur non trouvé:", email);
          return response.status(401).json({
            message: "Email ou mot de passe incorrect",
          });
        }

        // 4. Vérifier le mot de passe
        console.log("Comparaison mot de passe pour:", user.username);
        const isPasswordSame = bcrypt.compareSync(password, user.password);

        if (!isPasswordSame) {
          console.log("Mot de passe incorrect pour:", email);
          return response.status(401).json({
            message: "Email ou mot de passe incorrect",
          });
        }

        // 5. Créer le token JWT
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
          expiresIn: "7h",
        });

        // 6. Définir le cookie
        response.cookie("token", token, {
          httpOnly: true,
          secure: false, // En dev, false. En prod, true
          sameSite: "lax",
          maxAge: 7 * 60 * 60 * 1000, // 7 heures en millisecondes
        });

        console.log("Login réussi pour:", user.email);
        
        // 7. Réponse succès
        response.json({
          message: "Connexion réussie",
          userId: user.id,
          username: user.username,
        });
      } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        response.status(500).json({
          message: "Erreur serveur lors de la connexion",
        });
      }
    });

    app.use(isLoggedInJWT());

    // Route POST /post : création d'un post pour l'utilisateur connecté
    app.post("/post", async (request, response) => {
      try {
        const newPostData = request.body;
        console.log("Création de post par:", request.user.username);
        
        const newPost = await Post.create({
          title: newPostData.title || "Sans titre",
          content: newPostData.content,
          UserId: request.user.id,
        });
        
        console.log("Post créé:", newPost.id);
        return response.json(newPost);
      } catch (error) {
        console.error("Erreur création post:", error);
        return response
          .status(500)
          .json({ error: "Erreur serveur lors de la création du post" });
      }
    });

    // Route GET /posts : récupération de tous les posts
    app.get("/posts", async (request, response) => {
      try {
        const posts = await Post.findAll({
          include: [{
            model: User,
            attributes: ['id', 'username']
          }],
          order: [['createdAt', 'DESC']]
        });
        
        if (posts.length === 0) {
          return response.json({ message: "No posts available at the moment" });
        }
        
        response.json(posts);
      } catch (error) {
        console.error("Erreur récupération posts:", error);
        response.status(500).json({
          message: "Erreur serveur lors de la récupération des posts",
        });
      }
    });

    // Route GET /posts/:id : récupère un post par id
    app.get("/posts/:postId", async (request, response) => {
      try {
        const postId = request.params.postId;
        const post = await Post.findByPk(postId, {
          include: [
            {
              model: User,
              attributes: ['id', 'username']
            },
            {
              model: Commentaires,
              include: [{
                model: User,
                attributes: ['id', 'username']
              }]
            }
          ]
        });
        
        if (!post) {
          return response.status(404).json({ error: "Post non trouvé" });
        }
        
        return response.json(post);
      } catch (error) {
        console.error("Erreur récupération post:", error);
        return response.status(500).json({
          error: "Erreur serveur lors de la récupération du post",
        });
      }
    });

    // Route POST /posts/:postId/commentaires : ajout d'un commentaire à un post
    app.post("/posts/:postId/commentaires", async (request, response) => {
      try {
        const commentairesData = request.body;
        const postsId = request.params.postId;
        
        const post = await Post.findByPk(postsId);
        if (!post) {
          return response.status(404).json({ error: "Post non trouvé" });
        }
        
        const newCommentaire = await Commentaires.create({
          content: commentairesData.content,
          PostId: postsId,
          UserId: request.userId,
        });
        
        // Récupérer le commentaire avec l'utilisateur
        const commentWithUser = await Commentaires.findByPk(newCommentaire.id, {
          include: [{
            model: User,
            attributes: ['id', 'username']
          }]
        });
        
        console.log("Commentaire créé par:", request.user.username);
        return response.json(commentWithUser);
      } catch (error) {
        console.error("Erreur création commentaire:", error);
        return response
          .status(500)
          .json({ error: "Erreur serveur lors de la création du commentaire" });
      }
    });

    // Route GET /users/:userId/profile : profil utilisateur
    app.get("/users/:userId/profile", async (request, response) => {
      try {
        const userId = request.params.userId;
        
        // Récupérer l'utilisateur
        const user = await User.findByPk(userId, {
          attributes: ['id', 'username', 'email', 'createdAt']
        });
        
        if (!user) {
          return response.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        // Récupérer les posts de l'utilisateur
        const posts = await Post.findAll({
          where: { UserId: userId },
          include: [{
            model: User,
            attributes: ['id', 'username']
          }],
          order: [['createdAt', 'DESC']]
        });

        response.json({
          user: user,
          posts: posts || [],
        });
      } catch (error) {
        console.error("Erreur profile:", error);
        response.status(500).json({
          error: "Erreur du serveur lors de la récupération du profil",
        });
      }
    });

    // Route DELETE /commentaires/:commentId : supprime un commentaire si l'utilisateur est auteur
    app.delete("/commentaires/:commentairesId", async (request, response) => {
      try {
        const commentairesId = request.params.commentairesId;
        const commentaire = await Commentaires.findByPk(commentairesId);
        
        if (!commentaire) {
          return response.status(404).json({ error: "Commentaire non trouvé" });
        }
        
        if (commentaire.UserId != request.user.id) {
          return response.status(403).json({ error: "Accès refusé" });
        }
        
        await commentaire.destroy();
        console.log("Commentaire supprimé:", commentairesId);
        response.json({ message: "Commentaire supprimé avec succès" });
      } catch (error) {
        console.error("Erreur suppression commentaire:", error);
        return response.status(500).json({
          error: "Erreur serveur lors de la suppression du commentaire",
        });
      }
    });

    // Route DELETE /posts/:postId : supprime un post si l'utilisateur est auteur
    app.delete("/posts/:postId", async (request, response) => {
      try {
        const postId = request.params.postId;
        const userId = request.userId;

        const post = await Post.findByPk(postId);
        if (!post) {
          return response.status(404).json({ error: "Post non trouvé" });
        }

        if (post.UserId !== userId) {
          return response.status(403).json({ error: "Accès refusé" });
        }

        await post.destroy();
        console.log("Post supprimé:", postId);
        return response.json({ message: "Post supprimé avec succès" });
      } catch (error) {
        console.error("Erreur suppression post:", error);
        return response
          .status(500)
          .json({ error: "Erreur serveur lors de la suppression du post" });
      }
    });

    // Route GET /logout : supprime le cookie "token" pour déconnecter l'utilisateur
    app.get("/logout", (request, response) => {
      response.clearCookie("token");
      response.json({ message: "Déconnexion réussie" });
    });

    // Route GET /me : info utilisateur connecté
    app.get("/me", async (request, response) => {
      try {
        response.json({
          userId: request.userId,
          username: request.user.username,
          email: request.user.email
        });
      } catch (error) {
        console.error("Erreur /me:", error);
        response.status(500).json({ error: "Erreur serveur" });
      }
    });

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage de l'application:", error);
  }
}

main();