document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('symptomForm');
    const chatMessages = document.getElementById('chatMessages');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnIcon = document.querySelector('.btn-icon');
    const btnLoader = document.querySelector('.btn-loader');

    // Hide loading overlay after page loads
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 2000);

    // Add input animations
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const symptoms = document.getElementById('symptoms').value.trim();
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;

        if (!symptoms) {
            showNotification('Please describe your symptoms', 'error');
            return;
        }

        // Disable form while processing
        setLoading(true);

        // Display user message with animation
        addMessage('user', `Symptoms: ${symptoms}${age ? `, Age: ${age}` : ''}${gender ? `, Gender: ${gender}` : ''}`);

        try {
            const response = await fetch('/api/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symptoms: symptoms,
                    age: age,
                    gender: gender
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Display bot response with typing effect
                addBotDiagnosisWithTyping(data.diagnosis, data.disclaimer, data.source);
            } else {
                addMessage('bot', `❌ Error: ${data.error || 'Failed to get diagnosis. Please try again.'}`, true);
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('bot', '❌ Connection error. Please check your internet connection and try again.', true);
        } finally {
            setLoading(false);
        }

        // Clear form
        form.reset();
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        btnText.style.display = isLoading ? 'none' : 'inline';
        btnIcon.style.display = isLoading ? 'none' : 'inline';
        btnLoader.style.display = isLoading ? 'inline-flex' : 'none';
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#EF4444' : '#0EA5E9'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function addMessage(type, content, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (isError) {
            contentDiv.classList.add('error-message');
        }
        
        if (type === 'user') {
            contentDiv.innerHTML = `<div class="message-header">👤 You</div><div>${escapeHtml(content)}</div>`;
        } else {
            contentDiv.innerHTML = `<div class="message-header">🤖 HealthConnect Bot</div><div>${escapeHtml(content)}</div>`;
        }
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotDiagnosis(diagnosis, disclaimer, source) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Format the diagnosis with markdown-style rendering
        const formattedDiagnosis = formatDiagnosis(diagnosis);
        
        contentDiv.innerHTML = `
            <div class="message-header">
                🤖 HealthConnect Bot
                <span style="font-size: 0.8rem; font-weight: normal; opacity: 0.7;">(${source})</span>
            </div>
            <div class="diagnosis-content">${formattedDiagnosis}</div>
            <div class="disclaimer-text">${escapeHtml(disclaimer)}</div>
        `;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotDiagnosisWithTyping(diagnosis, disclaimer, source) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.innerHTML = `
            🤖 HealthConnect Bot
            <span style="font-size: 0.8rem; font-weight: normal; opacity: 0.7;">(${source})</span>
        `;
        
        const diagnosisDiv = document.createElement('div');
        diagnosisDiv.className = 'diagnosis-content';
        
        const disclaimerDiv = document.createElement('div');
        disclaimerDiv.className = 'disclaimer-text';
        disclaimerDiv.textContent = disclaimer;
        
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(diagnosisDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Typing effect
        let index = 0;
        const formattedDiagnosis = formatDiagnosis(diagnosis);
        const typingSpeed = 10; // milliseconds per character
        
        function typeText() {
            if (index < formattedDiagnosis.length) {
                diagnosisDiv.innerHTML = formattedDiagnosis.substring(0, index + 1) + '<span class="typing-cursor">|</span>';
                index++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(typeText, typingSpeed);
            } else {
                diagnosisDiv.innerHTML = formattedDiagnosis;
                contentDiv.appendChild(disclaimerDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        
        typeText();
    }

    function formatDiagnosis(text) {
        // Escape HTML first
        let formatted = escapeHtml(text);
        
        // Convert **text** to bold
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Convert bullet points
        formatted = formatted.replace(/^• (.+)$/gm, '<div style="margin-left: 20px; margin-bottom: 5px;">• $1</div>');
        
        // Preserve line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show welcome animation
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.style.opacity = '0';
        welcomeMsg.style.transform = 'translateY(20px)';
        setTimeout(() => {
            welcomeMsg.style.transition = 'all 0.5s ease';
            welcomeMsg.style.opacity = '1';
            welcomeMsg.style.transform = 'translateY(0)';
        }, 100);
    }
});
