import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// データベース接続設定
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_URL || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// 接続テスト
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ データベースに接続されました。');
  } catch (error) {
    console.error('❌ データベースに接続できませんでした:', error);
  }
};

testConnection();

export { sequelize };
export default sequelize;
