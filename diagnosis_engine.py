import os
from openai import OpenAI

class DiagnosisEngine:
    """
    AI-powered diagnosis engine that analyzes symptoms and provides
    health recommendations with medication suggestions
    """
    
    def __init__(self):
        """Initialize the diagnosis engine with AI model"""
        self.api_key = os.environ.get('OPENAI_API_KEY', '')
        self.use_openai = bool(self.api_key)
        
        if self.use_openai:
            self.client = OpenAI(api_key=self.api_key)
        
        # Fallback knowledge base for common conditions
        self.knowledge_base = self._load_knowledge_base()
    
    def _load_knowledge_base(self):
        """Load medical knowledge base for fallback diagnosis"""
        return {
            'fever': {
                'conditions': ['Common Cold', 'Flu', 'Viral Infection'],
                'medications': ['Paracetamol 500mg', 'Ibuprofen 200mg', 'Rest and fluids'],
                'severity': 'moderate'
            },
            'headache': {
                'conditions': ['Tension Headache', 'Migraine', 'Dehydration'],
                'medications': ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Adequate water intake'],
                'severity': 'low'
            },
            'cough': {
                'conditions': ['Common Cold', 'Bronchitis', 'Respiratory Infection'],
                'medications': ['Cough syrup', 'Steam inhalation', 'Honey and warm water'],
                'severity': 'moderate'
            },
            'sore throat': {
                'conditions': ['Pharyngitis', 'Tonsillitis', 'Viral Infection'],
                'medications': ['Throat lozenges', 'Warm salt water gargle', 'Paracetamol 500mg'],
                'severity': 'low'
            },
            'stomach pain': {
                'conditions': ['Gastritis', 'Indigestion', 'Food Poisoning'],
                'medications': ['Antacids', 'Probiotics', 'Light diet', 'Adequate hydration'],
                'severity': 'moderate'
            },
            'diarrhea': {
                'conditions': ['Gastroenteritis', 'Food Poisoning', 'Viral Infection'],
                'medications': ['ORS (Oral Rehydration Solution)', 'Probiotics', 'Light diet'],
                'severity': 'moderate'
            },
            'nausea': {
                'conditions': ['Motion Sickness', 'Gastritis', 'Food Poisoning'],
                'medications': ['Antiemetics', 'Ginger tea', 'Light meals'],
                'severity': 'low'
            },
            'fatigue': {
                'conditions': ['Anemia', 'Vitamin Deficiency', 'Sleep Deprivation'],
                'medications': ['Iron supplements', 'Vitamin B12', 'Proper rest'],
                'severity': 'low'
            },
            'body ache': {
                'conditions': ['Flu', 'Viral Fever', 'Muscle Strain'],
                'medications': ['Ibuprofen 400mg', 'Rest', 'Warm compress'],
                'severity': 'moderate'
            },
            'runny nose': {
                'conditions': ['Common Cold', 'Allergic Rhinitis', 'Sinusitis'],
                'medications': ['Antihistamines', 'Nasal decongestants', 'Steam inhalation'],
                'severity': 'low'
            }
        }
    
    def analyze_symptoms(self, symptoms, age='', gender=''):
        """
        Analyze patient symptoms and provide diagnosis with medications
        """
        if self.use_openai:
            return self._openai_diagnosis(symptoms, age, gender)
        else:
            return self._fallback_diagnosis(symptoms, age, gender)
    
    def _openai_diagnosis(self, symptoms, age, gender):
        """Use OpenAI API for advanced diagnosis"""
        try:
            patient_info = f"Age: {age}, Gender: {gender}" if age and gender else "Age and gender not provided"
            
            prompt = f"""You are a medical AI assistant for preliminary health screening. 
            
Patient Information: {patient_info}
Symptoms: {symptoms}

Provide a preliminary diagnosis with the following structure:
1. Most likely conditions (2-3 possibilities)
2. Recommended over-the-counter medications
3. General care advice
4. When to see a doctor (red flags)

Important: This is for informational purposes only and not a substitute for professional medical advice.
Be empathetic, clear, and helpful."""

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful medical AI assistant providing preliminary health screening. Always remind users to consult healthcare professionals for serious concerns."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            diagnosis_text = response.choices[0].message.content
            
            return {
                'success': True,
                'diagnosis': diagnosis_text,
                'disclaimer': '⚠️ This is an AI-generated preliminary assessment. Please consult a healthcare professional for accurate diagnosis and treatment.',
                'source': 'AI'
            }
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return self._fallback_diagnosis(symptoms, age, gender)
    
    def _fallback_diagnosis(self, symptoms, age, gender):
        """Fallback diagnosis using knowledge base"""
        symptoms_lower = symptoms.lower()
        matched_conditions = []
        all_medications = set()
        max_severity = 'low'
        
        # Match symptoms with knowledge base
        for symptom, data in self.knowledge_base.items():
            if symptom in symptoms_lower:
                matched_conditions.extend(data['conditions'])
                all_medications.update(data['medications'])
                if data['severity'] == 'moderate':
                    max_severity = 'moderate'
        
        # Remove duplicates
        matched_conditions = list(set(matched_conditions))
        
        # Generate diagnosis response
        if matched_conditions:
            diagnosis = f"""**Preliminary Assessment:**

**Possible Conditions:**
{chr(10).join([f'• {condition}' for condition in matched_conditions[:3]])}

**Recommended Medications:**
{chr(10).join([f'• {med}' for med in sorted(all_medications)])}

**General Care Advice:**
• Get adequate rest and sleep (7-8 hours)
• Stay well hydrated (8-10 glasses of water daily)
• Maintain a balanced, nutritious diet
• Avoid stress and strenuous activities
• Monitor your symptoms

**When to See a Doctor:**
• If symptoms persist for more than 3-5 days
• If symptoms worsen significantly
• If you develop high fever (>102°F/39°C)
• If you experience difficulty breathing
• If you have severe pain or discomfort

**Note:** This is a preliminary assessment based on common conditions. Please consult a healthcare professional for accurate diagnosis."""
        else:
            diagnosis = f"""**Unable to Match Specific Conditions**

Based on your symptoms: "{symptoms}", I recommend:

**General Recommendations:**
• Consult a healthcare professional for proper diagnosis
• Monitor your symptoms closely
• Maintain good hygiene and rest
• Stay hydrated

**When to See a Doctor Immediately:**
• Severe pain or discomfort
• High fever (>102°F/39°C)
• Difficulty breathing
• Chest pain
• Sudden weakness or numbness
• Severe headache or confusion

Your symptoms may require professional medical evaluation."""
        
        return {
            'success': True,
            'diagnosis': diagnosis,
            'disclaimer': '⚠️ This is a rule-based preliminary assessment. For AI-powered diagnosis, add your OpenAI API key. Always consult a healthcare professional for accurate diagnosis.',
            'source': 'Knowledge Base'
        }
