from datasets import load_dataset
import json
from pathlib import Path

DATASET_NAME = "yashpwr/resume-ner-training-data"
OUTPUT_DIR = Path(__file__).parent / "data"


def download_and_prepare():
    print(f"Loading dataset: {DATASET_NAME}")
    dataset = load_dataset(DATASET_NAME)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for split in ["train", "validation", "test"]:
        if split in dataset:
            print(f"Saving {split} split...")
            output_file = OUTPUT_DIR / f"{split}.jsonl"
            with open(output_file, "w", encoding="utf-8") as f:
                for item in dataset[split]:
                    f.write(json.dumps(item, ensure_ascii=False) + "\n")
            print(f"  Saved {len(dataset[split])} examples to {output_file}")

    print("\nDataset prepared successfully!")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"\nTo load data in training:")
    print(f"  from datasets import load_dataset")
    print(f"  dataset = load_dataset('json', data_files=str(OUTPUT_DIR / 'train.jsonl'))")


if __name__ == "__main__":
    download_and_prepare()
