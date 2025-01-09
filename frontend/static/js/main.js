document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const messageInput = document.querySelector('.message-input-container');
    
    // Add focus effects to input container
    userInput.addEventListener('focus', () => {
        messageInput.style.transform = 'translateX(-50%) scale(1.02)';
        messageInput.style.boxShadow = '0 8px 32px rgba(0, 74, 173, 0.2)';
    });
    
    userInput.addEventListener('blur', () => {
        messageInput.style.transform = 'translateX(-50%) scale(1)';
        messageInput.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.1)';
    });
    
    // Handle Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add hover effects to query containers
    const queryContainers = document.querySelectorAll('.query-container');
    queryContainers.forEach(container => {
        container.addEventListener('mousemove', handleQueryHover);
        container.addEventListener('mouseleave', removeQueryHover);
    });

    animateWelcomeSection();
    checkApiHealth();

    // Add sidebar toggle functionality
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        
        if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
            sidebar.classList.remove('active');
        }
    });
});

function handleQueryHover(e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    e.target.style.background = `
        radial-gradient(circle at ${x}px ${y}px, 
        rgba(255,255,255,0.1) 0%, 
        rgba(0,74,173,0) 50%)
    `;
}

function removeQueryHover(e) {
    e.target.style.background = '';
}

function animateWelcomeSection() {
    const header = document.querySelector('.header-section');
    const logo = document.querySelector('.ieee-logo');
    const welcomeText = document.querySelector('.welcome-text');
    const queriesGrid = document.querySelector('.queries-grid');
    
    // Initial animations
    header.style.opacity = '0';
    logo.style.opacity = '0';
    welcomeText.style.opacity = '0';
    queriesGrid.style.opacity = '0';
    
    // Sequence animations
    setTimeout(() => {
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 300);
    
    setTimeout(() => {
        logo.style.opacity = '1';
        logo.style.transform = 'translateY(0)';
    }, 600);
    
    setTimeout(() => {
        welcomeText.style.opacity = '1';
        welcomeText.style.transform = 'translateY(0)';
    }, 900);
    
    setTimeout(() => {
        queriesGrid.style.opacity = '1';
        queriesGrid.style.transform = 'translateY(0)';
    }, 1200);
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

    // Smooth transitions
    header.classList.add('minimized');
    logo.classList.add('minimized');
    welcomeText.classList.add('hidden');
    
    // Animate queries grid out
    queriesGrid.style.transform = 'translateY(20px)';
    queriesGrid.style.opacity = '0';
    setTimeout(() => {
        queriesGrid.classList.add('hidden');
    }, 300);

    // Animate chat messages in
    chatMessages.style.display = 'block';
    setTimeout(() => {
        chatMessages.classList.remove('hidden');
        chatMessages.style.opacity = '1';
        chatMessages.style.transform = 'translateY(0)';
    }, 300);
}

function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader-container';
    loader.innerHTML = '<img src="/static/images/loader.gif" alt="Loading..." class="loader-gif">';
    loader.style.opacity = '0';
    document.getElementById('chat-messages').appendChild(loader);
    
    requestAnimationFrame(() => {
        loader.style.opacity = '1';
    });
    
    return loader;
}

function removeLoader(loader) {
    if (loader && loader.parentElement) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.parentElement.removeChild(loader);
        }, 300);
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
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';

    if (isHtml) {
        messageDiv.innerHTML = text;
    } else {
        messageDiv.textContent = text;
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Trigger animation
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
    
    // Smooth scroll
    setTimeout(() => {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
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

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}