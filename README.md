# IEEE SB VIT PUNE RAG Chatbot

A Retrieval-Augmented Generation (RAG) chatbot for IEEE Student Branch VIT Pune.

## Setup Instructions

### 1. Environment Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

### 2. Environment Variables

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables in the `.env` file:
   ```
   MISTRAL_API_KEY=your_api_key_here
   ```

### 3. Running the Application

Start the backend server:
```bash
python -m backend.app
```

The server should now be running at `http://localhost:5000` (or your configured port).

## Contributing

Please read our contributing guidelines before making any changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
