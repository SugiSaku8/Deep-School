export default class JsonServerAPI {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    /**
     * データの検索
     * @param {string} query - 検索キーワード
     * @param {string} user - ユーザー名
     * @param {string} pass - パスワード
     * @param {boolean} detail - 詳細情報を取得するかどうか
     * @returns {Promise<Object>} 検索結果
     */
    async search(query, user, pass, detail = false) {
        try {
            const params = new URLSearchParams({
                query,
                user,
                pass,
                m: detail ? 'detail' : ''
            });

            const response = await fetch(`${this.baseUrl}/get?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '検索中にエラーが発生しました');
            }

            return data;
        } catch (error) {
            throw new Error(`検索エラー: ${error.message}`);
        }
    }

    /**
     * データの編集
     * @param {Object} params - 編集パラメータ
     * @param {string} params.user - ユーザー名
     * @param {string} params.pass - パスワード
     * @param {string} params.id - 編集対象のファイルID
     * @param {string} params.tfc - 2要素認証コード
     * @param {string} [params.did] - 編集対象のデータID（省略時はメタデータ編集）
     * @param {Object} params.data - 更新データ
     * @returns {Promise<Object>} 更新結果
     */
    async edit({ user, pass, id, tfc, did = null, data }) {
        try {
            const params = new URLSearchParams({
                quser: user,
                pass,
                id,
                tfc,
                data: JSON.stringify(data)
            });

            if (did) {
                params.append('did', did);
            }

            const response = await fetch(`${this.baseUrl}/edit?${params}`, {
                method: 'POST'
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '編集中にエラーが発生しました');
            }

            return result;
        } catch (error) {
            throw new Error(`編集エラー: ${error.message}`);
        }
    }
}