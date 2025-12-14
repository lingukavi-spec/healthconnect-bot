document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('symptomForm');
    const chatMessages = document.getElementById('chatMessages');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const symptoms = document.getElementById('symptoms').value.trim();
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;

        if (!symptoms) {
            alert('Please describe your symptoms');
            return;
        }

        // Disable form while processing
        setLoading(true);

        // Display user message
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
                // Display bot response
                addBotDiagnosis(data.diagnosis, data.disclaimer, data.source);
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
        btnLoader.style.display = isLoading ? 'inline-flex' : 'none';
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
