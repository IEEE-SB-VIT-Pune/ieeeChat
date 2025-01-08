"""This method can be used if you can afford to make API calls well within the limit to MISTRAL"""

"""Dependencies"""
import logging
import time
from backend.config import Settings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain_mistralai.embeddings import MistralAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

"""Loading and chunking the knowledge base"""
try:
    logger.info("Loading knowledge base...")
    loader = TextLoader(file_path='backend/data/knowledge_base.txt', encoding='utf-8')
    knowledge = loader.load()
    logger.info(f"Loaded {len(knowledge)} documents.")
except Exception as e:
    logger.error(f"Error loading file: {e}")
    raise

# Split documents into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=20,
    separators=['\n\n']
)
documents = text_splitter.split_documents(knowledge)
total_chunks = len(documents)
logger.info(f"Split into {total_chunks} chunks.")

"""Creating vector embeddings and storing them in FAISS"""
try:
    logger.info("Creating embeddings...")
    embeddings = MistralAIEmbeddings(
        model=Settings.EMBED_MODEL,
        mistral_api_key=Settings.MISTRAL_API_KEY
    )

    # Calculate batch size based on total chunks and desired number of API calls
    DESIRED_BATCHES = 50
    batch_size = total_chunks // DESIRED_BATCHES
    if total_chunks % DESIRED_BATCHES != 0:
        batch_size += 1  # Round up to ensure all documents are processed
    
    logger.info(f"Processing in {DESIRED_BATCHES} batches with approximately {batch_size} chunks per batch")
    
    vector = None
    for i in range(0, total_chunks, batch_size):
        batch = documents[i:i + batch_size]
        logger.info(f"Processing batch {(i//batch_size) + 1}/{DESIRED_BATCHES} with {len(batch)} chunks...")
        
        # Create FAISS index for this batch
        batch_vector = FAISS.from_documents(batch, embeddings)
        
        # Merge with existing index if not first batch
        if vector is None:
            vector = batch_vector
        else:
            vector.merge_from(batch_vector)
            
        if i + batch_size < total_chunks:  # Don't sleep after last batch
            logger.info("Waiting 60 seconds before next batch...")
            time.sleep(60)
    
    logger.info("All embeddings created successfully.")
except Exception as e:
    logger.error(f"Error creating embeddings: {e}")
    raise

"""Save the FAISS index to disk"""
try:
    logger.info("Saving FAISS index to disk...")
    vector.save_local("backend/data/faiss_index")
    logger.info("FAISS index saved successfully.")
except Exception as e:
    logger.error(f"Error saving FAISS index: {e}")
    raise