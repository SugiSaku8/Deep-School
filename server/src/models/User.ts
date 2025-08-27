import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// ユーザー属性のインターフェース
export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// 作成時や更新時に渡される可能性のある属性のインターフェース
type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isActive' | 'lastLoginAt' | 'createdAt' | 'updatedAt'>;

// ユーザーモデルクラス
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public role!: 'student' | 'teacher' | 'admin';
  public isActive!: boolean;
  public lastLoginAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // タイムスタンプ
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// モデルの初期化
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      allowNull: false,
      defaultValue: 'student',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

// モデルの関連付けやフックをここに追加
User.beforeCreate(async (user) => {
  // メールアドレスを小文字に統一
  user.email = user.email.toLowerCase();
  
  // パスワードのハッシュ化（実際の実装ではbcryptなどでハッシュ化）
  // user.password = await bcrypt.hash(user.password, 10);
});

// インスタンスメソッドの追加
declare global {
  namespace Express {
    interface User extends UserAttributes {}
  }
}

export default User;
