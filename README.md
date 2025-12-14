# 🏥 HealthConnect Bot - AI Health Diagnosis Assistant

An AI-powered web application that provides preliminary health diagnosis based on patient symptoms and suggests appropriate medications.

![HealthConnect Bot](https://img.shields.io/badge/Python-3.11-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 Features

- **AI-Powered Diagnosis**: Uses OpenAI GPT for intelligent symptom analysis (optional)
- **Fallback Knowledge Base**: Works without API keys using built-in medical knowledge
- **Patient Information**: Accepts age and gender for more accurate assessments
- **Medication Recommendations**: Suggests over-the-counter medications
- **Modern UI**: Beautiful, responsive web interface
- **Public Deployment Ready**: Easy deployment to Render, Railway, or Vercel
- **Health Check Endpoint**: Built-in monitoring endpoint

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Optional: OpenAI API key for advanced AI features

### Local Installation

1. **Clone or navigate to the project directory**
```bash
cd HealthConnect
```

2. **Create a virtual environment**
```bash
python -m venv venv
```

3. **Activate the virtual environment**
- Windows:
  ```bash
  venv\Scripts\activate
  ```
- macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Set up environment variables (Optional)**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key if you want AI-powered diagnosis
```

6. **Run the application**
```bash
python app.py
```

7. **Open your browser**
Navigate to: `http://localhost:5000`

## 🌐 Public Deployment

### Option 1: Deploy to Render

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the HealthConnect project
   - Use these settings:
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`

3. **Add Environment Variables** (Optional)
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: 5000 (auto-configured)

4. **Deploy** and get your public URL!

### Option 2: Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Click "New Project" → "Deploy from GitHub"**

3. **Select your repository**

4. **Add Environment Variables** (Optional)
   - `OPENAI_API_KEY`: Your OpenAI API key

5. **Deploy automatically** - Railway will detect Flask and deploy

### Option 3: Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Add Environment Variables** in Vercel Dashboard
   - `OPENAI_API_KEY`: Your OpenAI API key

## 📖 How It Works

### Without OpenAI API Key (Default)
The bot uses a built-in knowledge base with common conditions and treatments. It matches symptoms to known patterns and provides recommendations.

### With OpenAI API Key (Advanced)
The bot uses GPT-3.5-turbo for intelligent, context-aware diagnosis that considers patient age, gender, and symptom combinations.

## 🔧 API Endpoints

### `GET /`
Main web interface

### `POST /api/diagnose`
Diagnosis endpoint

**Request:**
```json
{
  "symptoms": "fever, headache, sore throat",
  "age": "25",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "diagnosis": "Detailed diagnosis text...",
  "disclaimer": "Medical disclaimer...",
  "source": "AI" or "Knowledge Base"
}
```

### `GET /api/health`
Health check endpoint for monitoring

## 🎨 Project Structure

```
HealthConnect/
├── app.py                  # Flask application
├── diagnosis_engine.py     # AI diagnosis logic
├── requirements.txt        # Python dependencies
├── Procfile               # Deployment config
├── runtime.txt            # Python version
├── vercel.json            # Vercel config
├── .env.example           # Environment template
├── templates/
│   └── index.html         # Web interface
├── static/
│   ├── style.css          # Styles
│   └── script.js          # Frontend logic
└── README.md              # Documentation
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No | None | OpenAI API key for AI diagnosis |
| `PORT` | No | 5000 | Server port |
| `FLASK_ENV` | No | production | Flask environment |

## 🛡️ Medical Disclaimer

**IMPORTANT**: This application provides preliminary health information only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.

## 📝 Features Roadmap

- [ ] Multi-language support
- [ ] Voice input for symptoms
- [ ] Symptom history tracking
- [ ] Integration with more medical databases
- [ ] User authentication
- [ ] Appointment booking integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Created with ❤️ for better healthcare accessibility

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation
- Review deployment platform docs

## 🔐 Security

- Never commit your `.env` file or API keys
- Use environment variables for sensitive data
- Keep dependencies updated
- Follow HIPAA guidelines if handling real patient data

## 📊 Testing

Test the health check endpoint:
```bash
curl http://localhost:5000/api/health
```

Test the diagnosis endpoint:
```bash
curl -X POST http://localhost:5000/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{"symptoms":"fever and cough","age":"30","gender":"male"}'
```

---

**Made for educational and informational purposes. Not for clinical use.**
