import pandas as pd

file_path = '/content/final_dataset.csv'  # Update this path if the file is in Google Drive

# Try reading the file with different encodings
try:
    df = pd.read_csv(file_path, encoding='utf-8')
except UnicodeDecodeError:
    try:
        df = pd.read_csv(file_path, encoding='latin1')
    except UnicodeDecodeError:
        df = pd.read_csv(file_path, encoding='ISO-8859-1')

# Remove rows with null values
df.dropna(inplace=True)

# Create the text file
output_file_path = '/content/output.txt'
with open(output_file_path, 'w', encoding='utf-8') as file:
    for index, row in df.iterrows():
        file.write(f"Question: {row['Question']}\n")
        file.write(f"Answer: {row['Answer']}\n\n")

print(f"Text file created at {output_file_path}")