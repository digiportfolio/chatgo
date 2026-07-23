const USE_STREAMING = true;

const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : `https://${window.location.hostname}`;

const API_URL_STREAM = `${BASE_URL}/chat-stream`;
const API_URL_NORMAL = `${BASE_URL}/chat`;

const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const modelSelect = document.getElementById('modelSelect');
const toast = document.getElementById('toast');

const modalOverlay = document.getElementById('modalOverlay');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

let isWaiting = false;

function scrollInputIntoView() {
    const isMobile = window.matchMedia("(max-width: 768px) and (hover: none)").matches || 
                     (('ontouchstart' in window) && window.innerWidth <= 768);
    if (!isMobile) return;

    setTimeout(() => {
        const inputArea = document.querySelector('.input-area');
        if (inputArea) {
            inputArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, 150);
}

userInput.addEventListener('focus', () => {
    scrollInputIntoView();
});

window.addEventListener('resize', () => {
    if (document.activeElement === userInput) {
        scrollInputIntoView();
    }
});

function showToast(message, isError = false) {
    toast.textContent = isError ? `❌ ${message}` : `✅ ${message}`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function showModal() {
    modalOverlay.classList.add('active');
}

function hideModal() {
    modalOverlay.classList.remove('active');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightCode(code, language = 'python') {
    let highlighted = code;
    
    const keywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'yield', 'async', 'await', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'];
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
    });
    
    highlighted = highlighted.replace(/(['"])(.*?)\1/g, `<span class="string">$1$2$1</span>`);
    
    highlighted = highlighted.replace(/\b(\d+)\b/g, `<span class="number">$1</span>`);
    
    highlighted = highlighted.replace(/(#.*$)/gm, `<span class="comment">$1</span>`);
    
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, `<span class="function">$1</span>(`);
    
    return highlighted;
}

function formatMessage(text) {
    let formattedText = escapeHtml(text);
    
    formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'python';
        const highlightedCode = highlightCode(code, language);
        return `<pre><code class="language-${language}">${highlightedCode}</code></pre>`;
    });
    
    formattedText = formattedText.replace(/`([^`]+)`/g, (match, code) => {
        const highlightedInline = highlightCode(code);
        return `<code>${highlightedInline}</code>`;
    });
    
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    formattedText = formattedText.replace(/&lt;(\/?)(\w+)([^&]*?)&gt;/g, (match, slash, tagName, attrs) => {
        return `<span class="html-tag">&lt;${slash}${tagName}${attrs}&gt;</span>`;
    });
    
    return formattedText;
}

window.copyMessage = function(btnElement) {
    const wrapper = btnElement.closest('.message-wrapper');
    if (!wrapper) return;
    const messageDiv = wrapper.querySelector('.message.ai');
    if (!messageDiv) return;
    let textToCopy = messageDiv.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = '✓ Tersalin';
        btnElement.classList.add('copied');
        
        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        showToast('Gagal menyalin', true);
    });
};

function loadChats() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        const messages = JSON.parse(saved);
        messagesDiv.innerHTML = '';
        messages.forEach(msg => {
            addMessage(msg.content, msg.role, false);
        });
        if (messages.length === 0) {
            addMessage("👋 Halo! Saya asisten AI.\n💡 Tanya apa saja!", 'ai', false);
        }
    } else {
        const existingGreeting = messagesDiv.querySelector('.message-wrapper.ai');
        if (!existingGreeting) {
            addMessage("👋 Halo! Saya asisten AI.\n💡 Tanya apa saja!", 'ai', false);
        }
    }
}

function saveChats() {
    const messages = [];
    document.querySelectorAll('.message-wrapper').forEach(wrapper => {
        const messageDiv = wrapper.querySelector('.message');
        if (messageDiv && !wrapper.classList.contains('loading-wrapper')) {
            const role = messageDiv.classList.contains('user') ? 'user' : 'ai';
            const content = messageDiv.innerText;
            messages.push({ role, content });
        }
    });
    localStorage.setItem('chatHistory', JSON.stringify(messages));
}

function addMessage(text, sender, save = true) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${sender}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'ai') {
        const formattedText = formatMessage(text);
        messageDiv.innerHTML = formattedText;
        wrapper.appendChild(messageDiv);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Salin';
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const textToCopy = messageDiv.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✓ Tersalin';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                showToast('Gagal menyalin', true);
            });
        });
        wrapper.appendChild(copyBtn);
    } 
    else {
        const formattedUser = escapeHtml(text).replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedUser;
        wrapper.appendChild(messageDiv);
    }
    
    messagesDiv.appendChild(wrapper);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    if (save) saveChats();
    return wrapper;
}

function showLoading() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper ai loading-wrapper';
    wrapper.id = 'loading-indicator-wrapper';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai loading';
    loadingDiv.innerHTML = '<span>●</span><span>●</span><span>●</span> AI mengetik...';
    wrapper.appendChild(loadingDiv);
    messagesDiv.appendChild(wrapper);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideLoading() {
    const loadingWrapper = document.getElementById('loading-indicator-wrapper');
    if (loadingWrapper) loadingWrapper.remove();
}

function getSelectedModel() {
    return modelSelect.value || DEFAULT_MODEL;
}

async function sendMessageStream(message, model) {
    const response = await fetch(API_URL_STREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper ai';
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message ai';
    wrapper.appendChild(aiMessageDiv);
    messagesDiv.appendChild(wrapper);
    
    let fullResponse = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) throw new Error(parsed.error);
                    if (parsed.content) {
                        fullResponse += parsed.content;
                        aiMessageDiv.innerHTML = formatMessage(fullResponse);
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }
                } catch (e) {}
            }
        }
    }
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '📋 Salin';
    copyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const textToCopy = aiMessageDiv.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓ Tersalin';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            showToast('Gagal menyalin', true);
        });
    });
    wrapper.appendChild(copyBtn);
    saveChats();
    return fullResponse;
}

async function sendMessageNormal(message, model) {
    const response = await fetch(API_URL_NORMAL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    addMessage(data.reply, 'ai');
    return data.reply;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isWaiting) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    isWaiting = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    
    const model = getSelectedModel();
    
    try {
        if (USE_STREAMING) {
            await sendMessageStream(message, model);
        } else {
            showLoading();
            await sendMessageNormal(message, model);
            hideLoading();
        }
    } catch (error) {
        hideLoading();
        addMessage(`❌ Error: ${error.message}`, 'ai');
        showToast(error.message, true);
    } finally {
        isWaiting = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        scrollInputIntoView();
    }
}

function performClearChat() {
    messagesDiv.innerHTML = '';
    addMessage('🧹 Chat telah dihapus. Mulai percakapan baru!', 'ai', false);
    localStorage.removeItem('chatHistory');
    showToast('Chat dihapus');
}

function clearChat() {
    showModal();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    darkModeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark');
        darkModeBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark');
        darkModeBtn.textContent = '🌙';
    }
}

function resetModelSelect() {
    modelSelect.value = '';
}

modalCancelBtn.addEventListener('click', () => {
    hideModal();
});

modalConfirmBtn.addEventListener('click', () => {
    performClearChat();
    hideModal();
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        hideModal();
    }
});

sendBtn.addEventListener('click', sendMessage);
clearBtn.addEventListener('click', clearChat);
darkModeBtn.addEventListener('click', toggleDarkMode);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

loadChats();
loadDarkMode();
resetModelSelect();
userInput.focus();

console.log('✅ ChatGO dengan enhanced code highlighting dan default model (Llama 3.3 70B) siap digunakan!');