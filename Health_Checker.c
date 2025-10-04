#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <windows.h>

#define MAX_TEXT 512

// Node types
typedef enum {
    QUESTION_NODE,
    DIAGNOSIS_NODE
} NodeType;

// Severity levels
typedef enum {
    EMERGENCY,
    URGENT,
    MODERATE,
    MILD
} Severity;

// Diagnosis structure
typedef struct {
    char condition[MAX_TEXT];
    Severity severity;
    char description[MAX_TEXT];
    char remedies[MAX_TEXT];
    char medications[MAX_TEXT];
    char when_to_see_doctor[MAX_TEXT];
    char prevention[MAX_TEXT];
} Diagnosis;

// Tree node structure
typedef struct TreeNode {
    NodeType type;
    char text[MAX_TEXT];
    struct TreeNode *yes_branch;
    struct TreeNode *no_branch;
    Diagnosis *diagnosis;
} TreeNode;

// Function prototypes
void enableANSI();
void sleepMs(int milliseconds);
void printSeparator(char c, int length);
void displayHeader(const char* title, const char* color);
void displayProgress(const char* message);
void clearInputBuffer();
char getUserResponse();
void displayWelcome();
TreeNode* createNode(NodeType type, const char* text);
Diagnosis* createDiagnosis(const char* condition, Severity severity, 
                           const char* description, const char* remedies,
                           const char* medications, const char* when_to_see,
                           const char* prevention);
TreeNode* createDiagnosisNode(Diagnosis* diag);
TreeNode* buildSymptomTree();
void displayDiagnosis(Diagnosis* diag);
void traverseTree(TreeNode* root);
void freeTree(TreeNode* root);

// Enable ANSI escape codes on Windows
void enableANSI() {
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    DWORD dwMode = 0;
    GetConsoleMode(hOut, &dwMode);
    dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
    SetConsoleMode(hOut, dwMode);
}

// Sleep function
void sleepMs(int milliseconds) {
    Sleep(milliseconds);
}

// Print separator line
void printSeparator(char c, int length) {
    for (int i = 0; i < length; i++) {
        printf("%c", c);
    }
}

// Display header with color
void displayHeader(const char* title, const char* color) {
    int length = 70;
    int title_len = strlen(title);
    int padding = (length - title_len - 2) / 2;
    
    printf("\n");
    printf("%s", color);
    printSeparator('=', length);
    printf("\n");
    for (int i = 0; i < padding; i++) printf(" ");
    printf("\033[1m%s\033[0m", title);
    printf("%s\n", color);
    printSeparator('=', length);
    printf("\033[0m\n");
}

// Display animated progress
void displayProgress(const char* message) {
    printf("\n\n  \033[36m%s\033[0m", message);
    for (int i = 0; i < 3; i++) {
        printf(".");
        fflush(stdout);
        sleepMs(300);
    }
    printf("\n");
    sleepMs(500);
}

// Clear input buffer
void clearInputBuffer() {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

// Get and validate user response
char getUserResponse() {
    char input[10];
    char response;
    
    while (1) {
        if (fgets(input, sizeof(input), stdin) != NULL) {
            // Remove newline if present
            input[strcspn(input, "\n")] = 0;
            
            if (strlen(input) > 0) {
                response = toupper(input[0]);
                
                if (response == 'Y' || response == 'N') {
                    return response;
                }
            }
        }
        
        printf("\033[31m  Invalid input. Please enter (Y)es or (N)o: \033[0m");
    }
}

// Display welcome message
void displayWelcome() {
    printf("\n");
    printf("\033[1m\033[36m");
    printSeparator('=', 70);
    printf("\n");
    printf("                    HEALTH CHECKER\n");
    printf("              Your Personal Health Assistant\n");
    printSeparator('=', 70);
    printf("\033[0m\n");
    
    printf("\n\033[1m\033[32m  Welcome!\033[0m This intelligent system will:\n");
    printf("  \033[32m[+]\033[0m Identify your potential health condition\n");
    printf("  \033[32m[+]\033[0m Provide specific medication recommendations\n");
    printf("  \033[32m[+]\033[0m Suggest home remedies and self-care tips\n");
    printf("  \033[32m[+]\033[0m Tell you when professional care is needed\n");
    
    printf("\n");
    printSeparator('-', 70);
    printf("\n\033[1m\033[36m  HOW IT WORKS:\033[0m\n");
    printf("  1. Answer simple YES/NO questions about your symptoms\n");
    printf("  2. Get a detailed diagnosis with treatment options\n");
    printf("  3. Follow the recommendations or seek professional help\n");
    printSeparator('-', 70);
    
    printf("\n\033[1m\033[33m  [!] IMPORTANT DISCLAIMER:\033[0m\n");
    printf("  This tool provides \033[1mgeneral guidance\033[0m based on common conditions.\n");
    printf("  It is \033[1mNOT\033[0m a replacement for professional medical advice.\n");
    printf("  \033[31mIf experiencing emergency symptoms, call 112 immediately!\033[0m\n");
    
    printf("\n");
    printSeparator('=', 70);
}

// Create a new tree node
TreeNode* createNode(NodeType type, const char* text) {
    TreeNode* node = (TreeNode*)malloc(sizeof(TreeNode));
    if (node == NULL) {
        printf("\033[31mMemory allocation failed!\033[0m\n");
        exit(1);
    }
    
    node->type = type;
    strncpy(node->text, text, MAX_TEXT - 1);
    node->text[MAX_TEXT - 1] = '\0';
    node->yes_branch = NULL;
    node->no_branch = NULL;
    node->diagnosis = NULL;
    
    return node;
}

// Create a diagnosis
Diagnosis* createDiagnosis(const char* condition, Severity severity,
                          const char* description, const char* remedies,
                          const char* medications, const char* when_to_see,
                          const char* prevention) {
    Diagnosis* diag = (Diagnosis*)malloc(sizeof(Diagnosis));
    if (diag == NULL) {
        printf("\033[31mMemory allocation failed!\033[0m\n");
        exit(1);
    }
    
    strncpy(diag->condition, condition, MAX_TEXT - 1);
    diag->condition[MAX_TEXT - 1] = '\0';
    strncpy(diag->description, description, MAX_TEXT - 1);
    diag->description[MAX_TEXT - 1] = '\0';
    strncpy(diag->remedies, remedies, MAX_TEXT - 1);
    diag->remedies[MAX_TEXT - 1] = '\0';
    strncpy(diag->medications, medications, MAX_TEXT - 1);
    diag->medications[MAX_TEXT - 1] = '\0';
    strncpy(diag->when_to_see_doctor, when_to_see, MAX_TEXT - 1);
    diag->when_to_see_doctor[MAX_TEXT - 1] = '\0';
    strncpy(diag->prevention, prevention, MAX_TEXT - 1);
    diag->prevention[MAX_TEXT - 1] = '\0';
    diag->severity = severity;
    
    return diag;
}

// Create diagnosis node
TreeNode* createDiagnosisNode(Diagnosis* diag) {
    TreeNode* node = (TreeNode*)malloc(sizeof(TreeNode));
    if (node == NULL) {
        printf("\033[31mMemory allocation failed!\033[0m\n");
        exit(1);
    }
    
    node->type = DIAGNOSIS_NODE;
    node->text[0] = '\0';
    node->yes_branch = NULL;
    node->no_branch = NULL;
    node->diagnosis = diag;
    
    return node;
}

// Display comprehensive diagnosis
void displayDiagnosis(Diagnosis* diag) {
    const char* severity_color;
    const char* severity_text;
    const char* severity_icon;
    
    // Set color and text based on severity
    switch(diag->severity) {
        case EMERGENCY:
            severity_color = "\033[31m";
            severity_text = "EMERGENCY";
            severity_icon = "[!!!]";
            break;
        case URGENT:
            severity_color = "\033[33m";
            severity_text = "URGENT";
            severity_icon = "[!!]";
            break;
        case MODERATE:
            severity_color = "\033[36m";
            severity_text = "MODERATE";
            severity_icon = "[!]";
            break;
        case MILD:
            severity_color = "\033[32m";
            severity_text = "MILD";
            severity_icon = "[i]";
            break;
        default:
            severity_color = "\033[37m";
            severity_text = "UNKNOWN";
            severity_icon = "[?]";
    }
    
    // Display diagnosis header
    printf("\n");
    printf("\033[1m%s", severity_color);
    printSeparator('=', 70);
    printf("\n");
    printf("  %s DIAGNOSIS: %s\n", severity_icon, diag->condition);
    printSeparator('=', 70);
    printf("\033[0m\n");
    
    // Severity indicator
    printf("\n\033[1m%s  SEVERITY LEVEL: %s\033[0m\n", severity_color, severity_text);
    
    // Description
    printf("\n\033[1m\033[34m  WHAT IS THIS?\033[0m\n");
    printf("  %s\n", diag->description);
    
    // Home remedies
    printf("\n\033[1m\033[32m  HOME REMEDIES & SELF-CARE:\033[0m\n");
    printf("  %s\n", diag->remedies);
    
    // Medications
    printf("\n\033[1m\033[35m  RECOMMENDED MEDICATIONS:\033[0m\n");
    printf("  %s\n", diag->medications);
    
    // When to see doctor
    printf("\n\033[1m\033[33m  WHEN TO SEE A DOCTOR:\033[0m\n");
    printf("  %s\n", diag->when_to_see_doctor);
    
    // Prevention
    printf("\n\033[1m\033[36m  PREVENTION TIPS:\033[0m\n");
    printf("  %s\n", diag->prevention);
    
    // Important disclaimer
    printf("\n");
    printSeparator('=', 70);
    printf("\n\033[1m\033[31m  IMPORTANT DISCLAIMER:\033[0m\n");
    printf("  This is for informational purposes only and not a substitute\n");
    printf("  for professional medical advice. Always consult a healthcare\n");
    printf("  provider for proper diagnosis and treatment.\n");
    printSeparator('=', 70);
    printf("\n");
}

// Build the comprehensive symptom decision tree
TreeNode* buildSymptomTree() {
    // Root question
    TreeNode* root = createNode(QUESTION_NODE, 
        "Are you experiencing severe chest pain, difficulty breathing, or loss of consciousness?");
    
    // EMERGENCY CONDITIONS
    Diagnosis* emergency = createDiagnosis(
        "POTENTIAL MEDICAL EMERGENCY",
        EMERGENCY,
        "You may be experiencing a life-threatening condition such as heart attack, stroke, or severe allergic reaction.",
        "DO NOT WAIT - Take immediate action",
        "Call emergency services (112) immediately",
        "RIGHT NOW - This is an emergency",
        "Regular health checkups, manage chronic conditions, know warning signs"
    );
    root->yes_branch = createDiagnosisNode(emergency);
    
    // Continue with less severe symptoms
    TreeNode* q2 = createNode(QUESTION_NODE, 
        "Do you have a fever (temperature above 38C)?");
    root->no_branch = q2;
    
    // FEVER PATH
    TreeNode* q3 = createNode(QUESTION_NODE, 
        "Is your fever accompanied by severe headache, stiff neck, or sensitivity to light?");
    q2->yes_branch = q3;
    
    // Possible Meningitis
    Diagnosis* meningitis = createDiagnosis(
        "POSSIBLE MENINGITIS OR SERIOUS INFECTION",
        URGENT,
        "These symptoms suggest a potentially serious infection affecting the brain or nervous system.",
        "Seek immediate medical attention - do not wait",
        "IV antibiotics or antivirals (hospital treatment required)",
        "Immediately - go to emergency room",
        "Stay up to date with vaccinations (meningococcal, pneumococcal)"
    );
    q3->yes_branch = createDiagnosisNode(meningitis);
    
    TreeNode* q4 = createNode(QUESTION_NODE, 
        "Have you had the fever for more than 3 days?");
    q3->no_branch = q4;
    
    TreeNode* q5 = createNode(QUESTION_NODE, 
        "Do you also have body aches, fatigue, and cough?");
    q4->yes_branch = q5;
    
    // Influenza (Flu)
    Diagnosis* flu = createDiagnosis(
        "INFLUENZA (FLU)",
        MODERATE,
        "You likely have the flu, a viral infection affecting the respiratory system. Most people recover within 1-2 weeks.",
        "Rest, drink plenty of fluids (water, warm soups), use a humidifier, gargle with salt water",
        "Acetaminophen (Tylenol) 500-1000mg every 6 hours OR Ibuprofen (Advil) 400mg every 6 hours for fever/pain. Antiviral medications (Tamiflu) if prescribed within 48 hours of symptom onset",
        "If fever persists beyond 5 days, difficulty breathing develops, or symptoms worsen",
        "Annual flu vaccination, frequent handwashing, avoid close contact with sick individuals"
    );
    q5->yes_branch = createDiagnosisNode(flu);
    
    // Bacterial Infection
    Diagnosis* bacterial = createDiagnosis(
        "POSSIBLE BACTERIAL INFECTION",
        URGENT,
        "Persistent fever may indicate a bacterial infection requiring antibiotics.",
        "Monitor temperature, stay hydrated, get plenty of rest",
        "See a doctor for evaluation - may need antibiotics like Amoxicillin or Azithromycin",
        "Within 24 hours - persistent fever needs medical evaluation",
        "Practice good hygiene, complete full course of antibiotics if prescribed"
    );
    q5->no_branch = createDiagnosisNode(bacterial);
    
    // Short-term fever
    Diagnosis* viral = createDiagnosis(
        "COMMON VIRAL INFECTION",
        MILD,
        "You likely have a common viral infection. Your body is fighting off the virus naturally.",
        "Rest, drink 8-10 glasses of water daily, eat nutritious foods (fruits, vegetables, soup)",
        "Acetaminophen (Tylenol) 500mg every 6 hours OR Ibuprofen (Advil) 400mg every 6 hours. Do NOT combine both. Take with food",
        "If fever exceeds 39.4C, lasts more than 3 days, or you develop new symptoms",
        "Good nutrition, adequate sleep (7-9 hours), regular exercise, stress management"
    );
    q4->no_branch = createDiagnosisNode(viral);
    
    // NO FEVER PATH
    TreeNode* q6 = createNode(QUESTION_NODE, 
        "Are you experiencing persistent cough or congestion?");
    q2->no_branch = q6;
    
    TreeNode* q7 = createNode(QUESTION_NODE, 
        "Do you have thick yellow/green mucus or cough lasting more than 10 days?");
    q6->yes_branch = q7;
    
    // Sinus Infection
    Diagnosis* sinusitis = createDiagnosis(
        "SINUSITIS (SINUS INFECTION)",
        MODERATE,
        "You likely have a sinus infection, which can be viral or bacterial. The thick, colored mucus and duration suggest possible bacterial sinusitis.",
        "Steam inhalation 2-3 times daily, nasal saline irrigation (Neti pot), warm compress on face, drink plenty of fluids, sleep with head elevated",
        "Decongestants: Pseudoephedrine (Sudafed) 30-60mg every 4-6 hours OR Phenylephrine (Sudafed PE) 10mg every 4 hours. Nasal spray: Fluticasone (Flonase) 2 sprays each nostril daily. Pain relief: Ibuprofen 400mg every 6 hours. If bacterial: doctor may prescribe Amoxicillin-Clavulanate",
        "If symptoms last more than 10 days, severe facial pain, vision changes, or high fever develops",
        "Use humidifier, avoid allergens and irritants, manage allergies, stay hydrated"
    );
    q7->yes_branch = createDiagnosisNode(sinusitis);
    
    TreeNode* q8 = createNode(QUESTION_NODE, 
        "Do you have runny nose, sneezing, and itchy/watery eyes?");
    q7->no_branch = q8;
    
    // Allergies
    Diagnosis* allergies = createDiagnosis(
        "ALLERGIC RHINITIS (ALLERGIES)",
        MILD,
        "You're experiencing allergic rhinitis, an allergic reaction to airborne substances like pollen, dust, or pet dander.",
        "Avoid triggers, keep windows closed during high pollen days, use HEPA air filters, shower after being outdoors, wash bedding weekly in hot water",
        "Antihistamines: Loratadine (Claritin) 10mg once daily OR Cetirizine (Zyrtec) 10mg once daily. Nasal spray: Fluticasone (Flonase) 2 sprays each nostril daily. Eye drops: Ketotifen (Zaditor) 1 drop each eye twice daily for itchy eyes",
        "If symptoms interfere with daily life, aren't controlled with OTC medications, or you want allergy testing",
        "Identify and avoid allergens, keep home clean, use air purifiers, consider allergy testing"
    );
    q8->yes_branch = createDiagnosisNode(allergies);
    
    // Common Cold
    Diagnosis* cold = createDiagnosis(
        "COMMON COLD",
        MILD,
        "You have a common cold, a viral upper respiratory infection. It typically resolves within 7-10 days.",
        "Rest 7-9 hours nightly, drink warm fluids (herbal tea, chicken soup), use humidifier, gargle with salt water (1/2 tsp salt in warm water), honey for cough (1-2 tsp)",
        "Pain/fever: Acetaminophen 500mg every 6 hours OR Ibuprofen 400mg every 6 hours. Cough: Dextromethorphan (Robitussin DM) 10-20mg every 4 hours OR Guaifenesin (Mucinex) 400mg every 4 hours for chest congestion. Nasal: Saline nasal spray as needed",
        "If symptoms worsen after 7 days, difficulty breathing, ear pain, or fever develops",
        "Frequent handwashing, avoid touching face, get adequate sleep, manage stress, eat nutritious diet"
    );
    q8->no_branch = createDiagnosisNode(cold);
    
    // NO RESPIRATORY SYMPTOMS
    TreeNode* q9 = createNode(QUESTION_NODE, 
        "Are you experiencing stomach pain, nausea, or digestive issues?");
    q6->no_branch = q9;
    
    TreeNode* q10 = createNode(QUESTION_NODE, 
        "Do you have diarrhea or vomiting?");
    q9->yes_branch = q10;
    
    TreeNode* q11 = createNode(QUESTION_NODE, 
        "Have symptoms lasted more than 48 hours or do you have signs of dehydration (dark urine, dizziness)?");
    q10->yes_branch = q11;
    
    // Severe Gastroenteritis
    Diagnosis* severe_gi = createDiagnosis(
        "SEVERE GASTROENTERITIS (STOMACH FLU)",
        URGENT,
        "Prolonged vomiting/diarrhea can lead to dangerous dehydration requiring medical attention.",
        "Sip oral rehydration solution (ORS) frequently, avoid solid foods temporarily, rest",
        "Oral Rehydration Solution (Pedialyte or WHO-ORS), Ondansetron (prescription) for severe vomiting. Doctor may prescribe anti-diarrheal medications or IV fluids",
        "Within 24 hours - dehydration is serious and may require IV fluids",
        "Hand hygiene, food safety (proper cooking/storage), avoid contaminated water"
    );
    q11->yes_branch = createDiagnosisNode(severe_gi);
    
    // Mild Gastroenteritis
    Diagnosis* gastro = createDiagnosis(
        "VIRAL GASTROENTERITIS (STOMACH BUG)",
        MILD,
        "You have a stomach bug, typically caused by a virus. Most cases resolve within 24-48 hours.",
        "Clear fluids first (water, clear broth, electrolyte drinks), then BRAT diet (Bananas, Rice, Applesauce, Toast), small frequent meals, rest, avoid dairy/fatty/spicy foods for 48 hours",
        "Oral Rehydration Solution (Pedialyte, Gatorade) - drink 8oz every hour. For nausea: Bismuth subsalicylate (Pepto-Bismol) 524mg every 30-60 minutes up to 8 doses/day. For diarrhea: Loperamide (Imodium) 4mg initially, then 2mg after each loose stool (max 8mg/day)",
        "If symptoms persist beyond 48 hours, blood in stool, severe abdominal pain, signs of dehydration",
        "Wash hands frequently, avoid contaminated food/water, clean surfaces, stay home when sick"
    );
    q11->no_branch = createDiagnosisNode(gastro);
    
    TreeNode* q12 = createNode(QUESTION_NODE, 
        "Do you have heartburn or burning sensation in chest/throat?");
    q10->no_branch = q12;
    
    // Acid Reflux/GERD
    Diagnosis* gerd = createDiagnosis(
        "ACID REFLUX / GERD (GASTROESOPHAGEAL REFLUX DISEASE)",
        MILD,
        "Stomach acid flowing back into the esophagus causes heartburn. Lifestyle changes and medication can help.",
        "Eat smaller meals, avoid trigger foods (spicy, fatty, acidic), don't eat 3 hours before bed, elevate head of bed 6-8 inches, lose weight if overweight, avoid tight clothing",
        "Antacids: Tums or Rolaids (calcium carbonate) 500-1000mg as needed. H2 blockers: Famotidine (Pepcid) 20mg twice daily. Proton Pump Inhibitors: Omeprazole (Prilosec) 20mg once daily before breakfast (max 14 days without doctor consultation)",
        "If symptoms occur more than twice a week, difficulty swallowing, persistent symptoms despite treatment, or unexplained weight loss",
        "Maintain healthy weight, avoid trigger foods, eat smaller meals, quit smoking, limit alcohol"
    );
    q12->yes_branch = createDiagnosisNode(gerd);
    
    // Indigestion
    Diagnosis* indigestion = createDiagnosis(
        "INDIGESTION (DYSPEPSIA)",
        MILD,
        "Mild stomach discomfort, often related to eating or stress. Usually resolves on its own.",
        "Eat slowly, chew thoroughly, avoid large meals, reduce stress, avoid trigger foods (caffeine, alcohol, chocolate, spicy foods), stay upright after eating",
        "Antacids: Tums (calcium carbonate) 500-1000mg as needed OR Maalox (aluminum/magnesium hydroxide) 10-20ml as needed. Take 1 hour after meals and at bedtime. Simethicone (Gas-X) 125mg for gas/bloating",
        "If pain is severe, persists for several days, or you have unexplained weight loss",
        "Eat balanced diet, manage stress, exercise regularly, avoid overeating, identify food triggers"
    );
    q12->no_branch = createDiagnosisNode(indigestion);
    
    // NO DIGESTIVE ISSUES
    TreeNode* q13 = createNode(QUESTION_NODE, 
        "Are you experiencing headache?");
    q9->no_branch = q13;
    
    TreeNode* q14 = createNode(QUESTION_NODE, 
        "Is it a severe, sudden headache (worst of your life) or accompanied by vision changes?");
    q13->yes_branch = q14;
    
    // Severe Headache - Emergency
    Diagnosis* severe_headache = createDiagnosis(
        "POSSIBLE SERIOUS HEADACHE CONDITION",
        EMERGENCY,
        "Sudden severe headache or headache with neurological symptoms requires immediate evaluation to rule out serious conditions.",
        "Seek immediate medical attention",
        "Emergency room evaluation required - do not take medication before evaluation",
        "IMMEDIATELY - Go to emergency room or call 112",
        "Manage blood pressure, avoid triggers, regular health checkups"
    );
    q14->yes_branch = createDiagnosisNode(severe_headache);
    
    TreeNode* q15 = createNode(QUESTION_NODE, 
        "Is it a throbbing headache on one side, possibly with nausea or light sensitivity?");
    q14->no_branch = q15;
    
    // Migraine
    Diagnosis* migraine = createDiagnosis(
        "MIGRAINE HEADACHE",
        MODERATE,
        "Migraines are intense headaches often with throbbing pain, nausea, and sensitivity to light/sound. They can last 4-72 hours.",
        "Rest in dark, quiet room; cold compress on forehead; stay hydrated; identify and avoid triggers (stress, certain foods, irregular sleep); gentle neck stretches; relaxation techniques",
        "Pain relief: Ibuprofen 400-600mg OR Naproxen 500mg at onset. Combination: Excedrin Migraine (acetaminophen + aspirin + caffeine) 2 tablets at onset. For frequent migraines, doctor may prescribe Sumatriptan (Imitrex) 50-100mg or preventive medications",
        "If migraines occur frequently (>4/month), don't respond to OTC medications, or significantly impact daily life - you may need prescription preventive medication",
        "Maintain regular sleep schedule, manage stress, stay hydrated, exercise regularly, identify food triggers, avoid skipping meals"
    );
    q15->yes_branch = createDiagnosisNode(migraine);
    
    // Tension Headache
    Diagnosis* tension = createDiagnosis(
        "TENSION HEADACHE",
        MILD,
        "Most common type of headache, causing mild to moderate pain, often described as a tight band around the head. Usually related to stress or muscle tension.",
        "Rest, stress management, neck/shoulder stretches, warm compress on neck, massage temples, relaxation breathing exercises, good posture, take breaks from screens",
        "Acetaminophen (Tylenol) 500-1000mg OR Ibuprofen (Advil) 400-600mg OR Aspirin 500-1000mg. Can be taken every 6 hours as needed. Topical: Menthol cream on temples. Caffeine may help (1 cup of coffee)",
        "If headaches occur frequently (>15 days/month), interfere with daily activities, or change in pattern",
        "Manage stress, maintain good posture, regular exercise, adequate sleep, stay hydrated, take frequent breaks from computer work"
    );
    q15->no_branch = createDiagnosisNode(tension);
    
    // NO HEADACHE
    TreeNode* q16 = createNode(QUESTION_NODE, 
        "Are you experiencing muscle or joint pain?");
    q13->no_branch = q16;
    
    TreeNode* q17 = createNode(QUESTION_NODE, 
        "Is the pain related to a recent injury or overuse?");
    q16->yes_branch = q17;
    
    // Muscle Strain/Sprain
    Diagnosis* strain = createDiagnosis(
        "MUSCLE STRAIN OR SPRAIN",
        MILD,
        "Overstretched or torn muscles/ligaments from injury or overuse. Usually heals within 1-2 weeks with proper care.",
        "RICE protocol: Rest (avoid painful activity), Ice (20 min every 2-3 hours for first 48-72 hours), Compression (elastic bandage), Elevation (above heart level). Gentle stretching after 48 hours",
        "Pain: Ibuprofen 400-600mg every 6 hours (better than acetaminophen for inflammation) OR Naproxen 500mg twice daily with food. Topical: Voltaren Gel (diclofenac) apply to affected area 4 times daily. Ice packs first 48 hours, then heat therapy",
        "If severe pain, inability to bear weight, significant swelling, numbness/tingling, or no improvement after 1 week",
        "Proper warm-up before exercise, gradual increase in activity, proper technique, adequate rest between workouts, maintain flexibility and strength"
    );
    q17->yes_branch = createDiagnosisNode(strain);
    
    // General body aches
    Diagnosis* body_aches = createDiagnosis(
        "GENERAL BODY ACHES (MYALGIA)",
        MILD,
        "Widespread muscle aches without specific injury, often from stress, tension, or minor viral infections.",
        "Gentle stretching, warm bath with Epsom salts (2 cups in bath), light massage, stay active with gentle movement, adequate sleep, stress management, stay hydrated (8-10 glasses water/day)",
        "Ibuprofen 400mg every 6 hours OR Acetaminophen 500-1000mg every 6 hours. Topical: Icy Hot or Bengay cream for localized relief. Magnesium supplement 300-400mg daily may help muscle relaxation",
        "If aches persist beyond 1 week, worsen, or accompanied by fever, rash, or other symptoms",
        "Regular exercise, good sleep hygiene, stress management, proper posture, stay hydrated, balanced diet with adequate protein"
    );
    q17->no_branch = createDiagnosisNode(body_aches);
    
    // NO PAIN
    TreeNode* q18 = createNode(QUESTION_NODE, 
        "Are you experiencing fatigue, weakness, or low energy?");
    q16->no_branch = q18;
    
    // Fatigue
    Diagnosis* fatigue = createDiagnosis(
        "GENERAL FATIGUE",
        MILD,
        "Persistent tiredness that doesn't improve with rest. Can be caused by stress, poor sleep, inadequate nutrition, or underlying conditions.",
        "Prioritize 7-9 hours quality sleep, regular sleep schedule, limit caffeine after 2pm, exercise 30 min daily (even walking), eat balanced meals with protein, stay hydrated, reduce stress, limit screen time before bed, take short breaks throughout day",
        "Address underlying causes first. Vitamin B-Complex supplement daily. Iron supplement if deficient (18mg daily for women, 8mg for men) - take with vitamin C for better absorption. Vitamin D3 2000 IU daily if deficient. Avoid energy drinks",
        "If fatigue persists despite lifestyle changes, worsens, or accompanied by other symptoms (weight changes, depression, shortness of breath) - may need blood tests for anemia, thyroid, or vitamin deficiencies",
        "Maintain consistent sleep schedule, balanced diet, regular exercise, stress management, limit alcohol, stay hydrated, take breaks from work"
    );
    q18->yes_branch = createDiagnosisNode(fatigue);
    
    // Generally well
    Diagnosis* general_wellness = createDiagnosis(
        "GENERAL WELLNESS CHECK",
        MILD,
        "You don't appear to have acute symptoms, but it's always good to maintain preventive health practices.",
        "Maintain healthy lifestyle: balanced diet rich in fruits/vegetables, regular exercise (150 min/week), adequate sleep (7-9 hours), stress management, stay hydrated, practice good hygiene",
        "Daily multivitamin can help fill nutritional gaps. Vitamin D3 2000 IU daily (especially if limited sun exposure). Omega-3 supplement for heart health",
        "Annual physical exam, age-appropriate screening tests, dental checkups twice yearly, vision exam yearly, any concerns about preventive health",
        "Healthy diet, regular exercise, adequate sleep, stress management, avoid smoking, limit alcohol, maintain social connections, regular health screenings"
    );
    q18->no_branch = createDiagnosisNode(general_wellness);
    
    return root;
}

// Traverse the tree based on user input
void traverseTree(TreeNode* root) {
    if (root == NULL) {
        return;
    }
    
    if (root->type == DIAGNOSIS_NODE) {
        // Display diagnosis
        displayProgress("Analyzing your symptoms");
        system("cls");
        displayDiagnosis(root->diagnosis);
        return;
    }
    
    // Question node - ask question and traverse based on answer
    printf("\n");
    printSeparator('-', 70);
    printf("\n\033[1m\033[36m  QUESTION:\033[0m %s\n", root->text);
    printSeparator('-', 70);
    printf("\n\033[33m  Answer (Y)es or (N)o: \033[0m");
    
    char response = getUserResponse();
    
    if (response == 'Y') {
        traverseTree(root->yes_branch);
    } else {
        traverseTree(root->no_branch);
    }
}

// Free the entire tree
void freeTree(TreeNode* root) {
    if (root == NULL) {
        return;
    }
    
    if (root->diagnosis != NULL) {
        free(root->diagnosis);
    }
    
    freeTree(root->yes_branch);
    freeTree(root->no_branch);
    free(root);
}

int main() {
    TreeNode* root;
    char choice;
    
    // Enable ANSI colors on Windows
    enableANSI();
    
    do {
        system("cls");
        displayWelcome();
        
        printf("\n\033[36mPress ENTER to begin assessment...\033[0m");
        getchar();
        
        system("cls");
        displayProgress("Initializing symptom checker");
        
        // Build the symptom tree
        root = buildSymptomTree();
        
        // Start the assessment
        traverseTree(root);
        
        // Free memory
        freeTree(root);
        
        // Ask if user wants to perform another assessment
        printf("\n\n");
        printSeparator('=', 70);
        printf("\n\033[1m\033[36mWould you like to check another condition? (Y/N): \033[0m");
        choice = getUserResponse();
        
    } while (choice == 'Y');
    
    system("cls");
    displayHeader("Thank You", "\033[32m");
    printf("\n");
    printf("  \033[32m* Thank you for using the HEALTH CHECKER!\033[0m\n");
    printf("  \033[33m* Remember: This is for informational purposes only\033[0m\n");
    printf("  \033[33m* Always consult healthcare professionals for medical advice\033[0m\n");
    printf("\n");
    printSeparator('=', 70);
    printf("\n\n");
    
    return 0;
}