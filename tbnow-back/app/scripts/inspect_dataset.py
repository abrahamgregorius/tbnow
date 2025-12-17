import os

DATASET_PATH = "dataset_raw"

for cls in os.listdir(DATASET_PATH):
    print(cls, "→", len(os.listdir(f"{DATASET_PATH}/{cls}")))
