from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from diagnosis_engine import DiagnosisEngine

app = Flask(__name__)
CORS(app)

# Initialize the diagnosis engine
diagnosis_engine = DiagnosisEngine()

@app.route('/')
def home():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    """
    API endpoint to diagnose symptoms and suggest medications
    Expected JSON: {"symptoms": "symptom1, symptom2, symptom3", "age": 30, "gender": "male"}
    """
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', '')
        age = data.get('age', '')
        gender = data.get('gender', '')
        
        if not symptoms:
            return jsonify({
                'error': 'Please provide symptoms'
            }), 400
        
        # Get diagnosis and medication recommendations
        result = diagnosis_engine.analyze_symptoms(symptoms, age, gender)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment platforms"""
    return jsonify({'status': 'healthy', 'service': 'HealthConnect Bot'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
