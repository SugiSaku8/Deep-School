# models/offense_detector.py
import fasttext
from typing import List, Tuple

class OffenseDetector:
    def __init__(self):
        self.model = None
        
    def train(self, texts: List[str], labels: List[int]):
        labeled_texts = [f"__label__{'OFFENSIVE' if label else 'NORMAL'} {text}" 
                        for text, label in zip(texts, labels)]
        
        with open("training_data.txt", "w", encoding='utf-8') as f:
            f.write("\n".join(labeled_texts))
            
        self.model = fasttext.train_supervised(
            input_data="training_data.txt",
            dim=300,
            lr=1.0,
            epoch=25,
            word_ngrams=2,
            bucket=200000,
            thread=4,
            lr_update_rate=100,
            loss='softmax'
        )
        
    def predict(self, text: str) -> Tuple[float, bool]:
        if not self.model:
            raise ValueError("モデルが学習されていません")
            
        label, prob = self.model.predict(text, k=2)
        return float(prob[0]), label[0].ends_with('__label__OFFENSIVE')