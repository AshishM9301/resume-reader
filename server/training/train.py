import torch
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification,
)
from datasets import Dataset, load_dataset
import json
from pathlib import Path
import numpy as np

MODEL_NAME = "distilbert-base-uncased"
DATASET_DIR = Path(__file__).parent.parent / "data_raw" / "data"
OUTPUT_DIR = Path(__file__).parent / "checkpoints"
LABEL_LIST = ["O", "B-PERSON", "I-PERSON", "B-EMAIL", "I-EMAIL", "B-PHONE", "I-PHONE",
              "B-SKILL", "I-SKILL", "B-ORG", "I-ORG", "B-LOCATION", "I-LOCATION",
              "B-EDUCATION", "I-EDUCATION", "B-EXPERIENCE", "I-EXPERIENCE"]
NUM_LABELS = len(LABEL_LIST)
LABEL2ID = {label: i for i, label in enumerate(LABEL_LIST)}
ID2LABEL = {i: label for i, label in enumerate(LABEL_LIST)}


def load_jsonl(file_path):
    data = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            data.append(json.loads(line))
    return Dataset.from_list(data)


def tokenize_and_align_labels(examples, tokenizer):
    tokenized_inputs = tokenizer(
        examples["tokens"],
        is_split_into_words=True,
        truncation=True,
        max_length=512,
        padding="max_length",
    )

    labels = []
    for i, label in enumerate(examples["ner_tags"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label[word_idx])
            else:
                label_ids.append(-100)
            previous_word_idx = word_idx
        labels.append(label_ids)

    tokenized_inputs["labels"] = labels
    return tokenized_inputs


def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=2)

    true_labels = []
    true_preds = []

    for pred_row, label_row in zip(predictions, labels):
        for pred, label in zip(pred_row, label_row):
            if label != -100:
                true_labels.append(ID2LABEL[label])
                true_preds.append(ID2LABEL[pred])

    from sklearn.metrics import classification_report
    report = classification_report(true_labels, true_preds, output_dict=True, zero_division=0)
    return {
        "precision": report["weighted avg"]["precision"],
        "recall": report["weighted avg"]["recall"],
        "f1": report["weighted avg"]["f1-score"],
    }


def main():
    print("Loading dataset...")
    train_data = load_jsonl(DATASET_DIR / "train.jsonl")
    val_data = load_jsonl(DATASET_DIR / "validation.jsonl") if (DATASET_DIR / "validation.jsonl").exists() else None

    print(f"Train samples: {len(train_data)}")
    print(f"Val samples: {len(val_data) if val_data else 'N/A'}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def preprocess(examples):
        return tokenize_and_align_labels(examples, tokenizer)

    train_dataset = train_data.map(preprocess, batched=True)
    val_dataset = val_data.map(preprocess, batched=True) if val_data else None

    model = AutoModelForTokenClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_LABELS,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=str(OUTPUT_DIR),
        num_train_epochs=5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        warmup_steps=500,
        weight_decay=0.01,
        learning_rate=5e-5,
        eval_strategy="epoch" if val_dataset else "no",
        save_strategy="epoch",
        load_best_model_at_end=True if val_dataset else False,
        fp16=True,
        logging_steps=100,
        report_to="none",
    )

    data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    print("Starting training...")
    trainer.train()

    final_model_path = OUTPUT_DIR / "final_model"
    model.save_pretrained(str(final_model_path))
    tokenizer.save_pretrained(str(final_model_path))
    print(f"Model saved to: {final_model_path}")


if __name__ == "__main__":
    main()
