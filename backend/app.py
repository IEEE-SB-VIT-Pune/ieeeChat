from flask import Flask, request, jsonify, render_template
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.chains.combine_documents import create_stuff_documents_chain
from backend.config import Settings
from functools import wraps
import time

app = Flask(__name__, 
            template_folder='../frontend/templates', 
            static_folder='../frontend/static')

# Initialize components
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector = FAISS.load_local("backend/data/faiss_index", embeddings, allow_dangerous_deserialization=True)
retriever = vector.as_retriever()
model = ChatMistralAI(mistral_api_key=Settings.MISTRAL_API_KEY, model_name=Settings.MODEL)

# Create prompt template
prompt = ChatPromptTemplate.from_template("""
        You are an assistant for IEEE Student Branch Vishwakarma Institute of Technology Pune. 
        You have been designed to answer questions pertaining to our student chapter often referred to as a club or committee.
        
        Guidelines:
        - Answer diligently from the retrieved context
        - Maintain respectful tone as you represent a 25-year-old respected Student Branch
        - Do not entertain offensive, illegal, or incorrect queries
        - Never portray IEEE Student Branch negatively
        - Explain IEEE Student Branch/Club/Committee as a student body facilitating technical activities
        - Answer from Student Branch perspective for IEEE-related questions
        - Don't directly promote IEEE memberships - it's user's choice
        - Emphasize IEEE's role in improving college's coding and tech culture
        - For joining queries, focus on workshop and seminar participation
        - Keep answers brief and to the point
        Answer the questions based on the provided context:
        <context>
        {context}
        </context>

        Question: {input}
""")

# Create chains
document_chain = create_stuff_documents_chain(model, prompt)
retrieval_chain = create_retrieval_chain(retriever, document_chain)

def error_handler(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e),
                "timestamp": time.time()
            }), 500
    return decorated_function

@app.route('/api/v1/query', methods=['POST'])
@error_handler
def query_ieee():
    """
    Endpoint to query the IEEE QA system
    Request body format:
    {
        "question": "What is IEEE Club?"
    }
    """
    data = request.get_json()
    
    if not data or 'question' not in data:
        return jsonify({
            "status": "error",
            "message": "Missing required field: question",
            "timestamp": time.time()
        }), 400
    
    question = data['question']
    
    if not isinstance(question, str) or not question.strip():
        return jsonify({
            "status": "error",
            "message": "Question must be a non-empty string",
            "timestamp": time.time()
        }), 400
    
    # Get response from chain
    response = retrieval_chain.invoke({"input": question})
    
    return jsonify({
        "status": "success",
        "data": {
            "question": question,
            "answer": response["answer"]
        },
        "timestamp": time.time()
    })

@app.route('/api/v1/health', methods=['GET'])
@error_handler
def health_check():
    """Health check endpoint to verify API status"""
    return jsonify({
        "status": "success",
        "message": "API is running",
        "timestamp": time.time()
    })

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)