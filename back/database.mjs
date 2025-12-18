import Sequelize, { DataTypes, ForeignKeyConstraintError } from "sequelize";
import bcrypt from "bcrypt";

export async function loadSequelize() {
  try {
    const login = {
      database: "threadapi-database",
      username: "root",
      password: "root",
    };

    const sequelize = new Sequelize(
      login.database,
      login.username,
      login.password,
      {
        host: "127.0.0.1",
        dialect: "mysql",
      }
    );

    const User = sequelize.define("User", {
      username: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      password: {
        type: DataTypes.STRING,
        set(clear) {
          const hashed = bcrypt.hashSync(clear, 10);
          this.setDataValue("password", hashed);
        },
      },
    });

    const Post = sequelize.define("Post", {
      title: DataTypes.TEXT,
      content: DataTypes.TEXT,
    });

    const Commentaires = sequelize.define("Commentaires", {
      content: DataTypes.TEXT,
    });

    // Définition des relations entre les modèles :
    User.hasMany(Post, {ForeignKey: "UserId"}); // Un utilisateur a plusieurs posts
    User.hasMany(Commentaires); // Un utilisateur a plusieurs commentaires
    Post.hasMany(Commentaires); // Un post a plusieurs commentaires
    Post.belongsTo(User, {ForeignKey: "UserId"}); // Un post appartient à un utilisateur
    Commentaires.belongsTo(User); // Un commentaire appartient à un utilisateur
    Commentaires.belongsTo(Post); // Un commentaire appartient à un post

    await sequelize.authenticate();

    await sequelize.sync({ force: true });

    // Insertion de test : création d'un utilisateur
    const billy = await User.create({
      username: "Billy",
      email: "billy@mail.com",
      password: "billy123",
    });

    // Insertion d'un post lié à Billy
    await billy.createPost({
      title: "Faire les courses",
      content: "ananas, savon, éponge",
    });

    

    // Retourne l'objet sequelize pour l'utiliser dans d'autres fichiers
    return sequelize;
  } catch (error) {
    // Affiche l'erreur en console si problème de connexion ou autre
    console.log(error);
    // Renvoie une erreur personnalisée
    throw new Error("Impossible de se connecter à la base de données");
  }
}
