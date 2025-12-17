import shutil
import os

# Manual path to downloaded dataset
src = r"C:\Users\ASUS\.cache\kagglehub\datasets\apolotdenise\chest-xrays-for-tb"  # Replace with actual path, e.g., r"C:\Users\ASUS\Downloads\chest-xrays-for-tb"
dst = "dataset_raw"

shutil.copytree(src, dst, dirs_exist_ok=True)
print("✅ Dataset copied to dataset_raw")
