import { sequelize } from '../config/database';
import { User } from '../models/User';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// データベースの初期化と同期
const initializeDatabase = async () => {
  try {
    // データベース接続をテスト
    await sequelize.authenticate();
    console.log('✅ データベースに接続されました。');

    // モデルを同期（テーブルが存在しなければ作成）
    await sequelize.sync({ force: true });
    console.log('🔄 データベースを同期しました。');

    // 初期データの投入（必要に応じて）
    await seedDatabase();
    
    console.log('✨ データベースの初期化が完了しました。');
    process.exit(0);
  } catch (error) {
    console.error('❌ データベースの初期化中にエラーが発生しました:', error);
    process.exit(1);
  }
};

// 初期データの投入
const seedDatabase = async () => {
  try {
    // 管理者ユーザーの作成
    await User.create({
      email: 'admin@example.com',
      password: 'admin123', // 実際のアプリではハッシュ化したパスワードを使用
      name: 'Admin User',
      role: 'admin',
      isActive: true
    });
    
    console.log('👤 管理者ユーザーを作成しました。');
  } catch (error) {
    console.error('初期データの投入中にエラーが発生しました:', error);
    throw error;
  }
};

// データベース初期化を実行
initializeDatabase();
