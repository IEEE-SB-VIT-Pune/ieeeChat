"""
This is a script to check avg tokens per question answer pair
Based on this we can determine efficient number of chunk_size and chunk_overlap
Based on the avg. tokens we can determine the chunk_size by accounting for variability;
say for 65 tokens we can account for some larger chunks and assume a safe size of 200;
consider 10-20% of chunk_size as overlap, so 30-60 would suffice for overlap.
"""
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")  # Use "cl100k_base" for GPT-3.5/4

file_path = "backend/data/knowledge_base.txt"
with open(file_path, "r", encoding="utf-8") as file:
    content = file.read()

pairs = content.strip().split("\n\n")

total_tokens = 0
num_pairs = len(pairs)

for pair in pairs:
    # Calculate the number of tokens for the current pair
    token_count = len(encoding.encode(pair))
    total_tokens += token_count

average_tokens = total_tokens / num_pairs

print(f"Total number of question-answer pairs: {num_pairs}")
print(f"Total tokens across all pairs: {total_tokens}")
print(f"Average tokens per pair: {average_tokens:.2f}")