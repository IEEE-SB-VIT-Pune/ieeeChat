// frontend/static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    checkApiHealth();
});

async function checkApiHealth() {
    try {
        const response = await fetch('/api/v1/health');
        const data = await response.json();
        if (data.status !== 'success') {
            console.error('API health check failed');
        }
    } catch (error) {
        console.error('API health check failed:', error);
    }
}

function handleSampleQuery(element) {
    const query = element.querySelector('p').textContent;
    document.getElementById('user-input').value = query;
    sendMessage();
}

function minimizeHeader() {
    const header = document.querySelector('.header-section');
    const logo = document.querySelector('.ieee-logo');
    const welcomeText = document.querySelector('.welcome-text');
    const queriesGrid = document.getElementById('queries-grid');
    const chatMessages = document.getElementById('chat-messages');

    // Minimize header and logo
    header.classList.add('minimized');
    logo.classList.add('minimized');

    // Hide welcome text and queries grid
    welcomeText.classList.add('hidden');
    queriesGrid.classList.add('hidden');

    // Show chat messages
    chatMessages.classList.remove('hidden');
}

function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader-container';
    loader.innerHTML = '<img src="/static/images/loader.gif" alt="Loading..." class="loader-gif">';
    document.getElementById('chat-messages').appendChild(loader);
    return loader;
}

function removeLoader(loader) {
    if (loader && loader.parentElement) {
        loader.parentElement.removeChild(loader);
    }
}

async function sendMessage() {
    const inputElement = document.getElementById('user-input');
    const message = inputElement.value.trim();
    
    if (!message) return;

    minimizeHeader();
    inputElement.value = '';

    addMessageToChat(message, 'user');
    
    const loader = showLoader();

    try {
        const response = await fetch('/api/v1/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: message })
        });

        const data = await response.json();

        removeLoader(loader);

        if (data.status === 'success') {
            const formattedHtml = marked.parse(data.data.answer);
            addMessageToChat(formattedHtml, 'bot', true);
        } else {
            addMessageToChat('Sorry, I encountered an error processing your request.', 'bot');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        removeLoader(loader);
        addMessageToChat('Sorry, there was an error communicating with the server.', 'bot');
    }
}


function addMessageToChat(text, sender, isHtml = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.classList.add('message', `${sender}-message`);

    // Render raw HTML if `isHtml` is true, else render as plain text
    if (isHtml) {
        messageDiv.innerHTML = text; 
    } else {
        messageDiv.textContent = text;
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to the bottom
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

function displayTypingEffect(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.classList.add('message', `${sender}-message`);
    messagesContainer.appendChild(messageDiv);

    let index = 0;
    const typingSpeed = 20; // Adjust typing speed (in milliseconds)

    function type() {
        if (index < text.length) {
            messageDiv.textContent += text.charAt(index);
            index++;
            setTimeout(type, typingSpeed);
        } else {
            // Scroll the page to the bottom of the new message
            messageDiv.scrollIntoView({ behavior: 'smooth' });
        }
    }

    type();
}