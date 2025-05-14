import re
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

class AutoLearningTextDetector:
    def __init__(self):
        self.model = make_pipeline(CountVectorizer(), MultinomialNB())
        self.trained = False

    def train(self, texts, labels):
        self.model.fit(texts, labels)
        self.trained = True

    def detect(self, text):
        if not self.trained:
            raise Exception("モデルがトレーニングされていません。")
        prediction = self.model.predict([text])
        return prediction[0]

# 学習データの準備
texts = [
    "頭おかしい",  # ネガティブ
    "死ね",        # ネガティブ
    "カス",        # ネガティブ
    "いいね",      # ポジティブ
    "素晴らしい",  # ポジティブ
    # 他のサンプルを追加
]
labels = [
    "ネガティブ",
    "ネガティブ",
    "ネガティブ",
    "ポジティブ",
    "ポジティブ",
    # 対応するラベルを追加
]

# 自動学習エージェントのインスタンスを作成
detector = AutoLearningTextDetector()

# モデルをトレーニング
detector.train(texts, labels)

# 新しいテキストを検出
new_text = "いいね欲しいからって都合の良い解釈するな"
result = detector.detect(new_text)

# 結果を表示
print("検出結果:", result)