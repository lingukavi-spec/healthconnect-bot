document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('symptomForm');
    const chatMessages = document.getElementById('chatMessages');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnIcon = document.querySelector('.btn-icon');
    const btnLoader = document.querySelector('.btn-loader');
    
    // Voice recognition
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceIndicator = document.getElementById('voiceIndicator');
    const symptomsTextarea = document.getElementById('symptoms');
    
    // Dark mode
    const darkModeToggle = document.getElementById('darkModeToggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    // Language selector
    const languageSelector = document.getElementById('languageSelector');
    
    // Share dialog
    const shareDialog = document.getElementById('shareDialog');
    const closeShareBtn = document.getElementById('closeShareBtn');
    
    let currentDiagnosisText = '';
    let recognition = null;

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            voiceBtn.classList.add('listening');
            voiceIndicator.style.display = 'flex';
            voiceBtn.querySelector('.voice-text').textContent = 'Stop';
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            symptomsTextarea.value = transcript;
            showNotification('Voice input captured!', 'success');
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            showNotification('Voice input error. Please try again.', 'error');
        };

        recognition.onend = function() {
            voiceBtn.classList.remove('listening');
            voiceIndicator.style.display = 'none';
            voiceBtn.querySelector('.voice-text').textContent = 'Speak';
        };
    }

    // Voice button click
    if (voiceBtn && recognition) {
        voiceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (voiceBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none';
    }

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        sunIcon.style.display = isDark ? 'none' : 'block';
        moonIcon.style.display = isDark ? 'block' : 'none';
        
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        showNotification(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'success');
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    // Language selector (basic implementation)
    languageSelector.addEventListener('change', function() {
        const lang = this.value;
        showNotification(`Language changed to ${this.options[this.selectedIndex].text}`, 'success');
        // In a full implementation, you would translate the UI here
    });

    // Share dialog handlers
    closeShareBtn.addEventListener('click', function() {
        shareDialog.style.display = 'none';
    });

    document.getElementById('copyBtn').addEventListener('click', function() {
        navigator.clipboard.writeText(currentDiagnosisText).then(() => {
            showNotification('✅ Diagnosis copied to clipboard!', 'success');
            shareDialog.style.display = 'none';
        }).catch(() => {
            showNotification('Failed to copy. Please try again.', 'error');
        });
    });

    document.getElementById('downloadBtn').addEventListener('click', function() {
        downloadAsPDF(currentDiagnosisText);
        showNotification('📄 Downloading diagnosis...', 'success');
        shareDialog.style.display = 'none';
    });

    document.getElementById('emailBtn').addEventListener('click', function() {
        const subject = encodeURIComponent('HealthConnect Diagnosis Report');
        const body = encodeURIComponent(currentDiagnosisText);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        shareDialog.style.display = 'none';
    });

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
        
        // Add share button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-diagnosis-btn';
        shareBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Share Diagnosis
        `;
        shareBtn.onclick = function() {
            currentDiagnosisText = `HEALTHCONNECT DIAGNOSIS REPORT\n\n${diagnosis}\n\n${disclaimer}`;
            document.getElementById('shareDialog').style.display = 'flex';
        };
        
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
                contentDiv.appendChild(shareBtn);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        
        typeText();
    }

    function downloadAsPDF(text) {
        // Create a simple text file download (PDF would require a library)
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HealthConnect-Diagnosis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
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
