// Severity levels
const SEVERITY = {
    EMERGENCY: 'EMERGENCY',
    URGENT: 'URGENT',
    MODERATE: 'MODERATE',
    MILD: 'MILD'
};

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const assessmentScreen = document.getElementById('assessment-screen');
const diagnosisScreen = document.getElementById('diagnosis-screen');
const startBtn = document.getElementById('start-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const diagnosisTitle = document.getElementById('diagnosis-title');
const severityBadge = document.getElementById('severity-badge');
const severityLevel = document.getElementById('severity-level');
const description = document.getElementById('description');
const remedies = document.getElementById('remedies');
const medications = document.getElementById('medications');
const whenToSee = document.getElementById('when-to-see');
const prevention = document.getElementById('prevention');
const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');
const progressFill = document.getElementById('progress-fill');

// New elements for features
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const assessmentHistory = document.getElementById('assessment-history');
const healthTipElement = document.getElementById('health-tip');
const findHospitalsBtn = document.getElementById('find-hospitals');
const saveAssessmentBtn = document.getElementById('save-assessment');
const mapContainer = document.getElementById('map');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Global variables
let rootNode = null;
let currentNode = null;
let questionCount = 0;
let totalQuestions = 10; // This will be updated dynamically
let currentDiagnosis = null;
let map = null;
let userLocation = null;

// Daily health tips
const healthTips = [
    "Drink at least 8 glasses of water daily to stay hydrated and support bodily functions.",
    "Get 7-9 hours of quality sleep each night for optimal health and cognitive function.",
    "Include a variety of colorful fruits and vegetables in your diet for essential vitamins and antioxidants.",
    "Take short breaks every hour if you work at a desk to reduce strain on your body.",
    "Practice deep breathing exercises to reduce stress and improve mental clarity.",
    "Walk for at least 30 minutes daily to boost cardiovascular health and mood.",
    "Limit processed foods and added sugars for better energy levels and weight management.",
    "Wash your hands frequently to prevent the spread of germs and infections.",
    "Maintain good posture to prevent back and neck pain, especially when using devices.",
    "Spend time outdoors to get natural sunlight and vitamin D for bone health.",
    "Practice mindfulness or meditation for 10 minutes daily to reduce stress and improve focus.",
    "Include healthy fats like avocados, nuts, and olive oil in your diet for brain health.",
    "Take the stairs instead of the elevator to increase daily physical activity.",
    "Laugh often - it's good for your immune system and releases endorphins."
];

// Initialize the application
function init() {
    buildSymptomTree();
    setupEventListeners();
    loadAssessmentHistory();
    displayDailyHealthTip();
    loadDarkModePreference();
    
    // Add subtle entrance animations
    document.querySelectorAll('.modern-card').forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// Set up event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startAssessment);
    yesBtn.addEventListener('click', () => answerQuestion('yes'));
    noBtn.addEventListener('click', () => answerQuestion('no'));
    restartBtn.addEventListener('click', restartAssessment);
    
    // Sidebar events
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    
    // Hospital finder
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'find-hospitals') {
            findNearestHospitals();
        }
    });
    
    // Save assessment
    saveAssessmentBtn.addEventListener('click', saveCurrentAssessment);
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Add hover effects to all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Add ripple effect
    createRippleEffect(darkModeToggle);
}

// Create ripple effect for buttons
function createRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Load dark mode preference
function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Display a random daily health tip
function displayDailyHealthTip() {
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    healthTipElement.textContent = healthTips[randomIndex];
}

// Toggle sidebar visibility
function toggleSidebar() {
    sidebar.classList.toggle('hidden');
    document.getElementById('main-content').classList.toggle('sidebar-open');
    
    // Add animation effect
    if (!sidebar.classList.contains('hidden')) {
        sidebar.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            sidebar.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            sidebar.style.transform = 'translateX(0)';
        }, 10);
    }
}

// Close sidebar
function closeSidebar() {
    sidebar.style.transform = 'translateX(0)';
    setTimeout(() => {
        sidebar.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        sidebar.style.transform = 'translateX(-100%)';
    }, 10);
    
    setTimeout(() => {
        sidebar.classList.add('hidden');
        document.getElementById('main-content').classList.remove('sidebar-open');
    }, 400);
}

// Load assessment history from localStorage
function loadAssessmentHistory() {
    const history = JSON.parse(localStorage.getItem('healthAssessmentHistory')) || [];
    updateAssessmentHistoryDisplay(history);
}

// Update assessment history display
function updateAssessmentHistoryDisplay(history) {
    if (history.length === 0) {
        assessmentHistory.innerHTML = '<p class="no-history">No previous assessments</p>';
        return;
    }
    
    assessmentHistory.innerHTML = '';
    history.slice().reverse().forEach((assessment, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-title">${assessment.condition}</div>
            <div class="history-date">${new Date(assessment.date).toLocaleString()}</div>
            <div class="history-severity ${assessment.severity.toLowerCase()}">${assessment.severity}</div>
        `;
        
        // Add fade-in animation
        historyItem.style.opacity = '0';
        historyItem.style.transform = 'translateX(-20px)';
        historyItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            historyItem.style.opacity = '1';
            historyItem.style.transform = 'translateX(0)';
        }, index * 50);
        
        historyItem.addEventListener('click', () => {
            displayHistoricalAssessment(assessment);
        });
        
        assessmentHistory.appendChild(historyItem);
    });
}

// Display historical assessment
function displayHistoricalAssessment(assessment) {
    closeSidebar();
    
    // Hide other screens
    welcomeScreen.classList.add('hidden');
    assessmentScreen.classList.add('hidden');
    
    // Update diagnosis screen with historical data
    diagnosisTitle.textContent = assessment.condition;
    severityLevel.textContent = assessment.severity;
    
    // Set severity badge
    severityBadge.textContent = getSeverityBadgeText(assessment.severity);
    severityBadge.className = 'severity ' + assessment.severity.toLowerCase();
    
    description.textContent = assessment.description;
    remedies.textContent = assessment.remedies;
    medications.textContent = assessment.medications;
    whenToSee.textContent = assessment.whenToSeeDoctor;
    prevention.textContent = assessment.prevention;
    
    // Show diagnosis screen
    diagnosisScreen.classList.remove('hidden');
    
    // Add entrance animation
    diagnosisScreen.style.opacity = '0';
    diagnosisScreen.style.transform = 'translateY(20px)';
    diagnosisScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        diagnosisScreen.style.opacity = '1';
        diagnosisScreen.style.transform = 'translateY(0)';
    }, 100);
}

// Save current assessment to history
function saveCurrentAssessment() {
    if (!currentDiagnosis) return;
    
    const assessment = {
        condition: currentDiagnosis.condition,
        severity: currentDiagnosis.severity,
        description: currentDiagnosis.description,
        remedies: currentDiagnosis.remedies,
        medications: currentDiagnosis.medications,
        whenToSeeDoctor: currentDiagnosis.whenToSeeDoctor,
        prevention: currentDiagnosis.prevention,
        date: new Date().toISOString()
    };
    
    // Get existing history
    const history = JSON.parse(localStorage.getItem('healthAssessmentHistory')) || [];
    
    // Add new assessment
    history.push(assessment);
    
    // Keep only the last 10 assessments
    if (history.length > 10) {
        history.shift();
    }
    
    // Save to localStorage
    localStorage.setItem('healthAssessmentHistory', JSON.stringify(history));
    
    // Update display
    updateAssessmentHistoryDisplay(history);
    
    // Show confirmation with animation
    const originalText = saveAssessmentBtn.innerHTML;
    saveAssessmentBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveAssessmentBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    
    setTimeout(() => {
        saveAssessmentBtn.innerHTML = originalText;
        if (document.body.classList.contains('dark-mode')) {
            saveAssessmentBtn.style.background = 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)';
        } else {
            saveAssessmentBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }, 2000);
}

// Start the assessment
function startAssessment() {
    welcomeScreen.classList.add('hidden');
    assessmentScreen.classList.remove('hidden');
    currentNode = rootNode;
    questionCount = 1;
    updateProgress();
    displayQuestion();
    
    // Add entrance animation
    assessmentScreen.style.opacity = '0';
    assessmentScreen.style.transform = 'translateY(20px)';
    assessmentScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        assessmentScreen.style.opacity = '1';
        assessmentScreen.style.transform = 'translateY(0)';
    }, 100);
}

// Display current question
function displayQuestion() {
    if (currentNode.type === 'DIAGNOSIS_NODE') {
        displayDiagnosis(currentNode.diagnosis);
        return;
    }
    
    questionText.textContent = currentNode.text;
    currentQuestionEl.textContent = questionCount;
    
    // Add subtle animation to question
    questionText.style.opacity = '0';
    questionText.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        questionText.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        questionText.style.opacity = '1';
        questionText.style.transform = 'translateX(0)';
    }, 50);
}

// Handle user answer
function answerQuestion(answer) {
    if (currentNode.type === 'DIAGNOSIS_NODE') {
        return;
    }
    
    questionCount++;
    updateProgress();
    
    if (answer === 'yes') {
        currentNode = currentNode.yesBranch;
    } else {
        currentNode = currentNode.noBranch;
    }
    
    displayQuestion();
}

// Update progress bar
function updateProgress() {
    const progress = Math.min((questionCount / totalQuestions) * 100, 100);
    progressFill.style.width = `${progress}%`;
    currentQuestionEl.textContent = questionCount;
    totalQuestionsEl.textContent = totalQuestions;
}

// Display diagnosis
function displayDiagnosis(diagnosis) {
    currentDiagnosis = diagnosis;
    
    assessmentScreen.classList.add('hidden');
    diagnosisScreen.classList.remove('hidden');
    
    diagnosisTitle.textContent = diagnosis.condition;
    severityLevel.textContent = diagnosis.severity;
    
    // Set severity badge
    severityBadge.textContent = getSeverityBadgeText(diagnosis.severity);
    severityBadge.className = 'severity ' + diagnosis.severity.toLowerCase();
    
    description.textContent = diagnosis.description;
    remedies.textContent = diagnosis.remedies;
    medications.textContent = diagnosis.medications;
    whenToSee.textContent = diagnosis.whenToSeeDoctor;
    prevention.textContent = diagnosis.prevention;
    
    // Reset hospital section
    document.getElementById('hospital-list').innerHTML = `
        <p>Click "Find Nearby Hospitals" to locate medical facilities</p>
        <button id="find-hospitals" class="btn btn-secondary">
            <i class="fas fa-map-marker-alt"></i> Find Nearby Hospitals
        </button>
    `;
    
    // Add entrance animation
    diagnosisScreen.style.opacity = '0';
    diagnosisScreen.style.transform = 'translateY(20px)';
    diagnosisScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        diagnosisScreen.style.opacity = '1';
        diagnosisScreen.style.transform = 'translateY(0)';
    }, 100);
}

// Get severity badge text
function getSeverityBadgeText(severity) {
    switch(severity) {
        case SEVERITY.EMERGENCY: return '[!!!] EMERGENCY';
        case SEVERITY.URGENT: return '[!!] URGENT';
        case SEVERITY.MODERATE: return '[!] MODERATE';
        case SEVERITY.MILD: return '[i] MILD';
        default: return '[?] UNKNOWN';
    }
}

// Restart assessment
function restartAssessment() {
    diagnosisScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    currentNode = rootNode;
    questionCount = 0;
    currentDiagnosis = null;
    
    // Add entrance animation
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transform = 'translateY(20px)';
    welcomeScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        welcomeScreen.style.opacity = '1';
        welcomeScreen.style.transform = 'translateY(0)';
    }, 100);
}

// Find nearest hospitals using OpenStreetMap
function findNearestHospitals() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    // Show loading message
    document.getElementById('hospital-list').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Locating your position and finding nearby hospitals...</p>';
    
    navigator.geolocation.getCurrentPosition(
        position => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Initialize map if not already done
            if (!map) {
                initMap();
            }
            
            // Center map on user location
            map.setView([userLocation.lat, userLocation.lng], 13);
            
            // Add user marker
            L.marker([userLocation.lat, userLocation.lng])
                .addTo(map)
                .bindPopup('Your Location')
                .openPopup();
            
            // Search for nearby hospitals and clinics
            searchNearbyMedicalFacilities(userLocation.lat, userLocation.lng);
        },
        error => {
            console.error('Error getting location:', error);
            document.getElementById('hospital-list').innerHTML = `
                <p><i class="fas fa-exclamation-triangle"></i> Unable to get your location. Please enable location services and try again.</p>
                <button id="find-hospitals" class="btn btn-secondary">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            `;
        }
    );
}

// Initialize the map
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Search for nearby medical facilities
function searchNearbyMedicalFacilities(lat, lng) {
    // In a real implementation, you would make an API call to OpenStreetMap
    // For this demo, we'll simulate the results
    
    // Simulated hospital data
    const hospitals = [
        { name: "General Hospital", address: "123 Main St, City Center", distance: "1.2 km", lat: lat + 0.01, lng: lng - 0.01 },
        { name: "City Medical Center", address: "456 Health Ave, Downtown", distance: "2.5 km", lat: lat - 0.02, lng: lng + 0.01 },
        { name: "Community Clinic", address: "789 Wellness Blvd, Suburb", distance: "3.1 km", lat: lat + 0.015, lng: lng + 0.02 },
        { name: "Specialty Care Hospital", address: "321 Healing Dr, Metro Area", distance: "4.2 km", lat: lat - 0.01, lng: lng - 0.02 },
        { name: "Urgent Care Center", address: "555 Emergency Lane, Westside", distance: "2.8 km", lat: lat + 0.005, lng: lng - 0.03 }
    ];
    
    // Update hospital list display
    displayHospitalList(hospitals);
    
    // Add hospital markers to map
    hospitals.forEach(hospital => {
        L.marker([hospital.lat, hospital.lng])
            .addTo(map)
            .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}<br>Distance: ${hospital.distance}`);
    });
}

// Display hospital list
function displayHospitalList(hospitals) {
    let hospitalListHTML = '<h4>🏥 Nearby Medical Facilities:</h4>';
    
    hospitals.forEach((hospital, index) => {
        hospitalListHTML += `
            <div class="hospital-item">
                <div class="hospital-name">${hospital.name}</div>
                <div class="hospital-address">${hospital.address}</div>
                <div class="hospital-distance">📍 ${hospital.distance}</div>
            </div>
        `;
    });
    
    document.getElementById('hospital-list').innerHTML = hospitalListHTML;
}

// Helper function to create a question node
function createQuestionNode(text) {
    return {
        type: 'QUESTION_NODE',
        text: text,
        yesBranch: null,
        noBranch: null
    };
}

// Helper function to create a diagnosis node
function createDiagnosisNode(diagnosis) {
    return {
        type: 'DIAGNOSIS_NODE',
        text: '',
        diagnosis: diagnosis
    };
}

// Diagnosis structure
class Diagnosis {
    constructor(condition, severity, description, remedies, medications, whenToSeeDoctor, prevention) {
        this.condition = condition;
        this.severity = severity;
        this.description = description;
        this.remedies = remedies;
        this.medications = medications;
        this.whenToSeeDoctor = whenToSeeDoctor;
        this.prevention = prevention;
    }
}

// Build the comprehensive symptom decision tree
function buildSymptomTree() {
    // Root question
    rootNode = createQuestionNode("Are you experiencing severe chest pain, difficulty breathing, or loss of consciousness?");
    
    // EMERGENCY CONDITIONS
    const emergency = new Diagnosis(
        "POTENTIAL MEDICAL EMERGENCY",
        SEVERITY.EMERGENCY,
        "You may be experiencing a life-threatening condition such as heart attack, stroke, or severe allergic reaction.",
        "DO NOT WAIT - Take immediate action",
        "Call emergency services (112) immediately",
        "RIGHT NOW - This is an emergency",
        "Regular health checkups, manage chronic conditions, know warning signs"
    );
    rootNode.yesBranch = createDiagnosisNode(emergency);
    
    // Continue with less severe symptoms
    const q2 = createQuestionNode("Do you have a fever (temperature above 38C)?");
    rootNode.noBranch = q2;
    
    // FEVER PATH
    const q3 = createQuestionNode("Is your fever accompanied by severe headache, stiff neck, or sensitivity to light?");
    q2.yesBranch = q3;
    
    // Possible Meningitis
    const meningitis = new Diagnosis(
        "POSSIBLE MENINGITIS OR SERIOUS INFECTION",
        SEVERITY.URGENT,
        "These symptoms suggest a potentially serious infection affecting the brain or nervous system.",
        "Seek immediate medical attention - do not wait",
        "IV antibiotics or antivirals (hospital treatment required)",
        "Immediately - go to emergency room",
        "Stay up to date with vaccinations (meningococcal, pneumococcal)"
    );
    q3.yesBranch = createDiagnosisNode(meningitis);
    
    const q4 = createQuestionNode("Have you had the fever for more than 3 days?");
    q3.noBranch = q4;
    
    const q5 = createQuestionNode("Do you also have body aches, fatigue, and cough?");
    q4.yesBranch = q5;
    
    // Influenza (Flu)
    const flu = new Diagnosis(
        "INFLUENZA (FLU)",
        SEVERITY.MODERATE,
        "You likely have the flu, a viral infection affecting the respiratory system. Most people recover within 1-2 weeks.",
        "Rest, drink plenty of fluids (water, warm soups), use a humidifier, gargle with salt water",
        "Acetaminophen (Tylenol) 500-1000mg every 6 hours OR Ibuprofen (Advil) 400mg every 6 hours for fever/pain. Antiviral medications (Tamiflu) if prescribed within 48 hours of symptom onset",
        "If fever persists beyond 5 days, difficulty breathing develops, or symptoms worsen",
        "Annual flu vaccination, frequent handwashing, avoid close contact with sick individuals"
    );
    q5.yesBranch = createDiagnosisNode(flu);
    
    // Bacterial Infection
    const bacterial = new Diagnosis(
        "POSSIBLE BACTERIAL INFECTION",
        SEVERITY.URGENT,
        "Persistent fever may indicate a bacterial infection requiring antibiotics.",
        "Monitor temperature, stay hydrated, get plenty of rest",
        "See a doctor for evaluation - may need antibiotics like Amoxicillin or Azithromycin",
        "Within 24 hours - persistent fever needs medical evaluation",
        "Practice good hygiene, complete full course of antibiotics if prescribed"
    );
    q5.noBranch = createDiagnosisNode(bacterial);
    
    // Short-term fever
    const viral = new Diagnosis(
        "COMMON VIRAL INFECTION",
        SEVERITY.MILD,
        "You likely have a common viral infection. Your body is fighting off the virus naturally.",
        "Rest, drink 8-10 glasses of water daily, eat nutritious foods (fruits, vegetables, soup)",
        "Acetaminophen (Tylenol) 500mg every 6 hours OR Ibuprofen (Advil) 400mg every 6 hours. Do NOT combine both. Take with food",
        "If fever exceeds 39.4C, lasts more than 3 days, or you develop new symptoms",
        "Good nutrition, adequate sleep (7-9 hours), regular exercise, stress management"
    );
    q4.noBranch = createDiagnosisNode(viral);
    
    // NO FEVER PATH
    const q6 = createQuestionNode("Are you experiencing persistent cough or congestion?");
    q2.noBranch = q6;
    
    const q7 = createQuestionNode("Do you have thick yellow/green mucus or cough lasting more than 10 days?");
    q6.yesBranch = q7;
    
    // Sinus Infection
    const sinusitis = new Diagnosis(
        "SINUSITIS (SINUS INFECTION)",
        SEVERITY.MODERATE,
        "You likely have a sinus infection, which can be viral or bacterial. The thick, colored mucus and duration suggest possible bacterial sinusitis.",
        "Steam inhalation 2-3 times daily, nasal saline irrigation (Neti pot), warm compress on face, drink plenty of fluids, sleep with head elevated",
        "Decongestants: Pseudoephedrine (Sudafed) 30-60mg every 4-6 hours OR Phenylephrine (Sudafed PE) 10mg every 4 hours. Nasal spray: Fluticasone (Flonase) 2 sprays each nostril daily. Pain relief: Ibuprofen 400mg every 6 hours. If bacterial: doctor may prescribe Amoxicillin-Clavulanate",
        "If symptoms last more than 10 days, severe facial pain, vision changes, or high fever develops",
        "Use humidifier, avoid allergens and irritants, manage allergies, stay hydrated"
    );
    q7.yesBranch = createDiagnosisNode(sinusitis);
    
    const q8 = createQuestionNode("Do you have runny nose, sneezing, and itchy/watery eyes?");
    q7.noBranch = q8;
    
    // Allergies
    const allergies = new Diagnosis(
        "ALLERGIC RHINITIS (ALLERGIES)",
        SEVERITY.MILD,
        "You're experiencing allergic rhinitis, an allergic reaction to airborne substances like pollen, dust, or pet dander.",
        "Avoid triggers, keep windows closed during high pollen days, use HEPA air filters, shower after being outdoors, wash bedding weekly in hot water",
        "Antihistamines: Loratadine (Claritin) 10mg once daily OR Cetirizine (Zyrtec) 10mg once daily. Nasal spray: Fluticasone (Flonase) 2 sprays each nostril daily. Eye drops: Ketotifen (Zaditor) 1 drop each eye twice daily for itchy eyes",
        "If symptoms interfere with daily life, aren't controlled with OTC medications, or you want allergy testing",
        "Identify and avoid allergens, keep home clean, use air purifiers, consider allergy testing"
    );
    q8.yesBranch = createDiagnosisNode(allergies);
    
    // Common Cold
    const cold = new Diagnosis(
        "COMMON COLD",
        SEVERITY.MILD,
        "You have a common cold, a viral upper respiratory infection. It typically resolves within 7-10 days.",
        "Rest 7-9 hours nightly, drink warm fluids (herbal tea, chicken soup), use humidifier, gargle with salt water (1/2 tsp salt in warm water), honey for cough (1-2 tsp)",
        "Pain/fever: Acetaminophen 500mg every 6 hours OR Ibuprofen 400mg every 6 hours. Cough: Dextromethorphan (Robitussin DM) 10-20mg every 4 hours OR Guaifenesin (Mucinex) 400mg every 4 hours for chest congestion. Nasal: Saline nasal spray as needed",
        "If symptoms worsen after 7 days, difficulty breathing, ear pain, or fever develops",
        "Frequent handwashing, avoid touching face, get adequate sleep, manage stress, eat nutritious diet"
    );
    q8.noBranch = createDiagnosisNode(cold);
    
    // NO RESPIRATORY SYMPTOMS
    const q9 = createQuestionNode("Are you experiencing stomach pain, nausea, or digestive issues?");
    q6.noBranch = q9;
    
    const q10 = createQuestionNode("Do you have diarrhea or vomiting?");
    q9.yesBranch = q10;
    
    const q11 = createQuestionNode("Have symptoms lasted more than 48 hours or do you have signs of dehydration (dark urine, dizziness)?");
    q10.yesBranch = q11;
    
    // Severe Gastroenteritis
    const severeGi = new Diagnosis(
        "SEVERE GASTROENTERITIS (STOMACH FLU)",
        SEVERITY.URGENT,
        "Prolonged vomiting/diarrhea can lead to dangerous dehydration requiring medical attention.",
        "Sip oral rehydration solution (ORS) frequently, avoid solid foods temporarily, rest",
        "Oral Rehydration Solution (Pedialyte or WHO-ORS), Ondansetron (prescription) for severe vomiting. Doctor may prescribe anti-diarrheal medications or IV fluids",
        "Within 24 hours - dehydration is serious and may require IV fluids",
        "Hand hygiene, food safety (proper cooking/storage), avoid contaminated water"
    );
    q11.yesBranch = createDiagnosisNode(severeGi);
    
    // Mild Gastroenteritis
    const gastro = new Diagnosis(
        "VIRAL GASTROENTERITIS (STOMACH BUG)",
        SEVERITY.MILD,
        "You have a stomach bug, typically caused by a virus. Most cases resolve within 24-48 hours.",
        "Clear fluids first (water, clear broth, electrolyte drinks), then BRAT diet (Bananas, Rice, Applesauce, Toast), small frequent meals, rest, avoid dairy/fatty/spicy foods for 48 hours",
        "Oral Rehydration Solution (Pedialyte, Gatorade) - drink 8oz every hour. For nausea: Bismuth subsalicylate (Pepto-Bismol) 524mg every 30-60 minutes up to 8 doses/day. For diarrhea: Loperamide (Imodium) 4mg initially, then 2mg after each loose stool (max 8mg/day)",
        "If symptoms persist beyond 48 hours, blood in stool, severe abdominal pain, signs of dehydration",
        "Wash hands frequently, avoid contaminated food/water, clean surfaces, stay home when sick"
    );
    q11.noBranch = createDiagnosisNode(gastro);
    
    const q12 = createQuestionNode("Do you have heartburn or burning sensation in chest/throat?");
    q10.noBranch = q12;
    
    // Acid Reflux/GERD
    const gerd = new Diagnosis(
        "ACID REFLUX / GERD (GASTROESOPHAGEAL REFLUX DISEASE)",
        SEVERITY.MILD,
        "Stomach acid flowing back into the esophagus causes heartburn. Lifestyle changes and medication can help.",
        "Eat smaller meals, avoid trigger foods (spicy, fatty, acidic), don't eat 3 hours before bed, elevate head of bed 6-8 inches, lose weight if overweight, avoid tight clothing",
        "Antacids: Tums or Rolaids (calcium carbonate) 500-1000mg as needed. H2 blockers: Famotidine (Pepcid) 20mg twice daily. Proton Pump Inhibitors: Omeprazole (Prilosec) 20mg once daily before breakfast (max 14 days without doctor consultation)",
        "If symptoms occur more than twice a week, difficulty swallowing, persistent symptoms despite treatment, or unexplained weight loss",
        "Maintain healthy weight, avoid trigger foods, eat smaller meals, quit smoking, limit alcohol"
    );
    q12.yesBranch = createDiagnosisNode(gerd);
    
    // Indigestion
    const indigestion = new Diagnosis(
        "INDIGESTION (DYSPEPSIA)",
        SEVERITY.MILD,
        "Mild stomach discomfort, often related to eating or stress. Usually resolves on its own.",
        "Eat slowly, chew thoroughly, avoid large meals, reduce stress, avoid trigger foods (caffeine, alcohol, chocolate, spicy foods), stay upright after eating",
        "Antacids: Tums (calcium carbonate) 500-1000mg as needed OR Maalox (aluminum/magnesium hydroxide) 10-20ml as needed. Take 1 hour after meals and at bedtime. Simethicone (Gas-X) 125mg for gas/bloating",
        "If pain is severe, persists for several days, or you have unexplained weight loss",
        "Eat balanced diet, manage stress, exercise regularly, avoid overeating, identify food triggers"
    );
    q12.noBranch = createDiagnosisNode(indigestion);
    
    // NO DIGESTIVE ISSUES
    const q13 = createQuestionNode("Are you experiencing headache?");
    q9.noBranch = q13;
    
    const q14 = createQuestionNode("Is it a severe, sudden headache (worst of your life) or accompanied by vision changes?");
    q13.yesBranch = q14;
    
    // Severe Headache - Emergency
    const severeHeadache = new Diagnosis(
        "POSSIBLE SERIOUS HEADACHE CONDITION",
        SEVERITY.EMERGENCY,
        "Sudden severe headache or headache with neurological symptoms requires immediate evaluation to rule out serious conditions.",
        "Seek immediate medical attention",
        "Emergency room evaluation required - do not take medication before evaluation",
        "IMMEDIATELY - Go to emergency room or call 112",
        "Manage blood pressure, avoid triggers, regular health checkups"
    );
    q14.yesBranch = createDiagnosisNode(severeHeadache);
    
    const q15 = createQuestionNode("Is it a throbbing headache on one side, possibly with nausea or light sensitivity?");
    q14.noBranch = q15;
    
    // Migraine
    const migraine = new Diagnosis(
        "MIGRAINE HEADACHE",
        SEVERITY.MODERATE,
        "Migraines are intense headaches often with throbbing pain, nausea, and sensitivity to light/sound. They can last 4-72 hours.",
        "Rest in dark, quiet room; cold compress on forehead; stay hydrated; identify and avoid triggers (stress, certain foods, irregular sleep); gentle neck stretches; relaxation techniques",
        "Pain relief: Ibuprofen 400-600mg OR Naproxen 500mg at onset. Combination: Excedrin Migraine (acetaminophen + aspirin + caffeine) 2 tablets at onset. For frequent migraines, doctor may prescribe Sumatriptan (Imitrex) 50-100mg or preventive medications",
        "If migraines occur frequently (>4/month), don't respond to OTC medications, or significantly impact daily life - you may need prescription preventive medication",
        "Maintain regular sleep schedule, manage stress, stay hydrated, exercise regularly, identify food triggers, avoid skipping meals"
    );
    q15.yesBranch = createDiagnosisNode(migraine);
    
    // Tension Headache
    const tension = new Diagnosis(
        "TENSION HEADACHE",
        SEVERITY.MILD,
        "Most common type of headache, causing mild to moderate pain, often described as a tight band around the head. Usually related to stress or muscle tension.",
        "Rest, stress management, neck/shoulder stretches, warm compress on neck, massage temples, relaxation breathing exercises, good posture, take breaks from screens",
        "Acetaminophen (Tylenol) 500-1000mg OR Ibuprofen (Advil) 400-600mg OR Aspirin 500-1000mg. Can be taken every 6 hours as needed. Topical: Menthol cream on temples. Caffeine may help (1 cup of coffee)",
        "If headaches occur frequently (>15 days/month), interfere with daily activities, or change in pattern",
        "Manage stress, maintain good posture, regular exercise, adequate sleep, stay hydrated, take frequent breaks from computer work"
    );
    q15.noBranch = createDiagnosisNode(tension);
    
    // NO HEADACHE
    const q16 = createQuestionNode("Are you experiencing muscle or joint pain?");
    q13.noBranch = q16;
    
    const q17 = createQuestionNode("Is the pain related to a recent injury or overuse?");
    q16.yesBranch = q17;
    
    // Muscle Strain/Sprain
    const strain = new Diagnosis(
        "MUSCLE STRAIN OR SPRAIN",
        SEVERITY.MILD,
        "Overstretched or torn muscles/ligaments from injury or overuse. Usually heals within 1-2 weeks with proper care.",
        "RICE protocol: Rest (avoid painful activity), Ice (20 min every 2-3 hours for first 48-72 hours), Compression (elastic bandage), Elevation (above heart level). Gentle stretching after 48 hours",
        "Pain: Ibuprofen 400-600mg every 6 hours (better than acetaminophen for inflammation) OR Naproxen 500mg twice daily with food. Topical: Voltaren Gel (diclofenac) apply to affected area 4 times daily. Ice packs first 48 hours, then heat therapy",
        "If severe pain, inability to bear weight, significant swelling, numbness/tingling, or no improvement after 1 week",
        "Proper warm-up before exercise, gradual increase in activity, proper technique, adequate rest between workouts, maintain flexibility and strength"
    );
    q17.yesBranch = createDiagnosisNode(strain);
    
    // General body aches
    const bodyAches = new Diagnosis(
        "GENERAL BODY ACHES (MYALGIA)",
        SEVERITY.MILD,
        "Widespread muscle aches without specific injury, often from stress, tension, or minor viral infections.",
        "Gentle stretching, warm bath with Epsom salts (2 cups in bath), light massage, stay active with gentle movement, adequate sleep, stress management, stay hydrated (8-10 glasses water/day)",
        "Ibuprofen 400mg every 6 hours OR Acetaminophen 500-1000mg every 6 hours. Topical: Icy Hot or Bengay cream for localized relief. Magnesium supplement 300-400mg daily may help muscle relaxation",
        "If aches persist beyond 1 week, worsen, or accompanied by fever, rash, or other symptoms",
        "Regular exercise, good sleep hygiene, stress management, proper posture, stay hydrated, balanced diet with adequate protein"
    );
    q17.noBranch = createDiagnosisNode(bodyAches);
    
    // NO PAIN
    const q18 = createQuestionNode("Are you experiencing fatigue, weakness, or low energy?");
    q16.noBranch = q18;
    
    // Fatigue
    const fatigue = new Diagnosis(
        "GENERAL FATIGUE",
        SEVERITY.MILD,
        "Persistent tiredness that doesn't improve with rest. Can be caused by stress, poor sleep, inadequate nutrition, or underlying conditions.",
        "Prioritize 7-9 hours quality sleep, regular sleep schedule, limit caffeine after 2pm, exercise 30 min daily (even walking), eat balanced meals with protein, stay hydrated, reduce stress, limit screen time before bed, take short breaks throughout day",
        "Address underlying causes first. Vitamin B-Complex supplement daily. Iron supplement if deficient (18mg daily for women, 8mg for men) - take with vitamin C for better absorption. Vitamin D3 2000 IU daily if deficient. Avoid energy drinks",
        "If fatigue persists despite lifestyle changes, worsens, or accompanied by other symptoms (weight changes, depression, shortness of breath) - may need blood tests for anemia, thyroid, or vitamin deficiencies",
        "Maintain consistent sleep schedule, balanced diet, regular exercise, stress management, limit alcohol, stay hydrated, take breaks from work"
    );
    q18.yesBranch = createDiagnosisNode(fatigue);
    
    // Generally well
    const generalWellness = new Diagnosis(
        "GENERAL WELLNESS CHECK",
        SEVERITY.MILD,
        "You don't appear to have acute symptoms, but it's always good to maintain preventive health practices.",
        "Maintain healthy lifestyle: balanced diet rich in fruits/vegetables, regular exercise (150 min/week), adequate sleep (7-9 hours), stress management, stay hydrated, practice good hygiene",
        "Daily multivitamin can help fill nutritional gaps. Vitamin D3 2000 IU daily (especially if limited sun exposure). Omega-3 supplement for heart health",
        "Annual physical exam, age-appropriate screening tests, dental checkups twice yearly, vision exam yearly, any concerns about preventive health",
        "Healthy diet, regular exercise, adequate sleep, stress management, avoid smoking, limit alcohol, maintain social connections, regular health screenings"
    );
    q18.noBranch = createDiagnosisNode(generalWellness);
    
    // Set total questions based on the longest path in the tree
    totalQuestions = 6; // Approximate maximum depth of the tree
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);