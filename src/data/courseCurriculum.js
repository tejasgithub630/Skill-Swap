// src/data/courseCurriculum.js
// Comprehensive curriculum, verified embed links, and interactive clinical simulations

export const courseCurriculum = {
  // ==========================================
  // MEDICAL COURSES
  // ==========================================
  'Pharmacology': {
    title: 'Pharmacology',
    domain: 'MEDICAL',
    category: 'Preclinical',
    instructor: 'Dr. James Wilson, PharmD & Clinical Toxicologist',
    aiSummary: '🤖 AI Summary: Master clinical drug mechanisms, pharmacokinetics, and receptor interactions. Learn how medications alter physiology, safe dosing strategies, drug-drug interactions, and clinical pharmacology protocols for emergency and hospital care.',
    modules: [
      {
        id: 'pharm_mod_1',
        title: 'Pharmacokinetics: ADME Principles & Therapeutic Index',
        duration: '24 mins',
        completed: false,
        visualizerType: 'drug_receptor',
        youtubeId: 'GvZq67dcHXs',
        objectives: [
          'Understand bioavailability (F) and volume of distribution (Vd)',
          'Differentiate zero-order vs first-order drug elimination kinetics',
          'Calculate loading dose and maintenance dose based on clearance'
        ],
        keyPoints: [
          'First-pass hepatic metabolism dramatically lowers oral bioavailability for drugs like lidocaine and nitroglycerin.',
          'Zero-order elimination (constant amount/time): Phenytoin, Ethanol, Aspirin at toxic doses.',
          'Therapeutic Index (TI = TD50 / ED50): Warfarin, Digoxin, and Lithium possess narrow therapeutic indices requiring serum drug monitoring.'
        ],
        timestamps: [
          { time: '00:00', label: 'Introduction to Pharmacokinetics' },
          { time: '05:24', label: 'Absorption & First-Pass Metabolism' },
          { time: '10:48', label: 'Volume of Distribution (Vd) & Protein Binding' },
          { time: '16:12', label: 'Clearance & Half-Life Calculations' },
          { time: '21:36', label: 'Clinical Case Application: Dosing in Renal Failure' }
        ],
        quiz: {
          question: 'A patient with severe renal impairment requires Digoxin. Which pharmacokinetic parameter is most significantly reduced?',
          options: ['Volume of distribution', 'Renal clearance', 'Absorption rate', 'Plasma protein binding'],
          answer: 1,
          explanation: 'Digoxin is excreted primarily unchanged by the kidneys. Renal clearance is directly reduced in kidney disease, necessitating dose reduction.'
        }
      },
      {
        id: 'pharm_mod_2',
        title: 'Autonomic Nervous System & Adrenergic Agonists/Antagonists',
        duration: '8 mins',
        completed: false,
        visualizerType: 'drug_receptor',
        youtubeId: 'qeXP_ricT4s',
        objectives: [
          'Map alpha-1, alpha-2, beta-1, beta-2, and beta-3 adrenergic receptors',
          'Compare Epinephrine, Norepinephrine, and Dopamine hemodynamics',
          'Analyze beta-blocker selectivity and adverse bronchospasm risks'
        ],
        keyPoints: [
          'Alpha-1 (Gq): Vasoconstriction, mydriasis, urinary retention. Agonist: Phenylephrine.',
          'Beta-1 (Gs): Increased heart rate, contractility, renin release. Target: Dobutamine, Metoprolol.',
          'Beta-2 (Gs): Bronchodilation, vasodilation, glycogenolysis. Non-selective beta-blockers (e.g. Propranolol) are contraindicated in asthma.'
        ],
        timestamps: [
          { time: '00:00', label: 'Sympathetic vs Parasympathetic Signaling' },
          { time: '01:48', label: 'G-Protein Pathways (q, i, s)' },
          { time: '03:36', label: 'Vasopressor Comparison: Norepinephrine vs Epinephrine' },
          { time: '05:24', label: 'Selective vs Non-Selective Beta-Blockers' },
          { time: '07:12', label: 'Clinical Scenarios: Anaphylaxis & Septic Shock' }
        ],
        quiz: {
          question: 'Which receptor subtype is responsible for bronchodilation when stimulated by Albuterol?',
          options: ['Alpha-1', 'Beta-1', 'Beta-2', 'Muscarinic M2'],
          answer: 2,
          explanation: 'Albuterol is a selective Beta-2 adrenergic receptor agonist that increases intracellular cAMP, producing smooth muscle relaxation and bronchodilation.'
        }
      },
      {
        id: 'pharm_mod_3',
        title: 'Cardiovascular Pharmacology: Antihypertensives & Antiarrhythmics',
        duration: '19 mins',
        completed: false,
        visualizerType: 'cardiac_ekg',
        youtubeId: 'OwcKBZafrWU',
        objectives: [
          'Differentiate ACE inhibitors, ARBs, and Calcium Channel Blockers',
          'Review Vaughan-Williams antiarrhythmic classes (I through IV)',
          'Manage acute hypertensive crisis with IV hydralazine/labetalol'
        ],
        keyPoints: [
          'ACE inhibitors (e.g. Lisinopril) inhibit bradykinin breakdown, causing persistent dry cough and rare angioedema.',
          'Class III antiarrhythmics (Amiodarone, Sotalol) prolong Phase 3 repolarization and QT interval, risking Torsades de Pointes.',
          'Dihydropyridines (Amlodipine) act primarily on vascular smooth muscle; Non-dihydropyridines (Verapamil, Diltiazem) depress cardiac conduction.'
        ],
        timestamps: [
          { time: '00:00', label: 'RAAS Axis Inhibition' },
          { time: '04:16', label: 'Calcium Channel Blockers: Vascular vs Cardiac' },
          { time: '08:33', label: 'Vaughan-Williams Class I to IV Antiarrhythmics' },
          { time: '12:49', label: 'Amiodarone Toxicity Monitoring (Thyroid, Pulmonary, Liver)' },
          { time: '17:06', label: 'Emergency Management of Arrhythmias' }
        ],
        quiz: {
          question: 'Which antihypertensive drug class is contraindicated in bilateral renal artery stenosis due to risk of acute renal failure?',
          options: ['Calcium channel blockers', 'ACE inhibitors', 'Thiazide diuretics', 'Alpha-1 blockers'],
          answer: 1,
          explanation: 'ACE inhibitors cause efferent arteriolar vasodilation, causing a precipitous drop in glomerular filtration pressure in patients with bilateral renal artery stenosis.'
        }
      },
      {
        id: 'pharm_mod_4',
        title: 'Antimicrobial Pharmacology & Antibiotic Stewardship',
        duration: '88 mins',
        completed: false,
        visualizerType: 'cellular_pathology',
        youtubeId: 'bbYxLiByufk',
        objectives: [
          'Classify cell-wall synthesis inhibitors, protein synthesis inhibitors, and DNA inhibitors',
          'Identify mechanisms of antibiotic resistance (beta-lactamases, efflux pumps)',
          'Select empiric therapies for common nosocomial and community-acquired infections'
        ],
        keyPoints: [
          'Beta-lactams (Penicillins, Cephalosporins, Carbapenems) inhibit transpeptidases cross-linking peptidoglycan cell walls.',
          'Aminoglycosides (Gentamicin) and Macrolides (Azithromycin) inhibit 30S and 50S ribosomal subunits, respectively.',
          'Vancomycin binds D-Ala-D-Ala terminals; resistance occurs through D-Ala-D-Lac mutation in VRSA and VRE.'
        ],
        timestamps: [
          { time: '00:00', label: 'Bacterial Cell Wall Targets' },
          { time: '19:48', label: 'Ribosomal 30S vs 50S Inhibitors' },
          { time: '39:36', label: 'Fluoroquinolones & Antimetabolites' },
          { time: '59:24', label: 'MRSA and Pseudomonas Coverage Strategies' },
          { time: '79:12', label: 'Summary & Clinical Prescribing Rules' }
        ],
        quiz: {
          question: 'What is the molecular mechanism of Vancomycin resistance in enterococci?',
          options: ['Beta-lactamase production', 'Efflux pump upregulation', 'D-Ala-D-Ala replaced by D-Ala-D-Lac', 'PBP2a transpeptidase mutation'],
          answer: 2,
          explanation: 'Vancomycin-resistant enterococci (VRE) replace the terminal D-Ala-D-Ala with D-Ala-D-Lac, drastically reducing vancomycin binding affinity.'
        }
      }
    ]
  },

  'Pathology': {
    title: 'Pathology',
    domain: 'MEDICAL',
    category: 'Preclinical',
    instructor: 'Dr. Emily Rose, MD, Anatomic & Clinical Pathologist',
    aiSummary: '🤖 AI Summary: Explore cellular responses to stress, inflammatory cascades, tissue repair, and neoplastic transformation. Connect histopathology slide patterns directly to bedside diagnosis and disease progression.',
    modules: [
      {
        id: 'path_mod_1',
        title: 'Cellular Adaptations, Necrosis & Apoptosis Pathways',
        duration: '15 mins',
        completed: false,
        visualizerType: 'cellular_pathology',
        youtubeId: 'jRZHDhHf3tA',
        objectives: [
          'Differentiate hypertrophy, hyperplasia, atrophy, and metaplasia',
          'Compare coagulative, liquefactive, caseous, and fat necrosis',
          'Detail extrinsic (FasL/TNF) vs intrinsic (Bcl-2/Cytochrome c) apoptosis'
        ],
        keyPoints: [
          'Metaplasia is reversible (e.g. Barrett esophagus: stratified squamous converts to nonciliated columnar with goblet cells).',
          'Coagulative necrosis: Preserved cellular architecture without nuclei, classic in ischemic stroke (except brain) and myocardial infarction.',
          'Liquefactive necrosis: Typical of CNS infarcts and bacterial abscesses with enzymatic liquefaction.'
        ],
        timestamps: [
          { time: '00:00', label: 'Cellular Stress and Adaptations' },
          { time: '03:22', label: 'Ischemia vs Hypoxia' },
          { time: '06:45', label: 'Six Morphologic Patterns of Necrosis' },
          { time: '10:07', label: 'Mitochondrial vs Death Receptor Apoptosis' },
          { time: '13:30', label: 'Histologic Slide Interpretations' }
        ],
        quiz: {
          question: 'Which type of necrosis is uniquely characteristic of cerebral infarction (ischemic stroke)?',
          options: ['Coagulative necrosis', 'Liquefactive necrosis', 'Caseous necrosis', 'Fibrinoid necrosis'],
          answer: 1,
          explanation: 'Ischemia in the central nervous system uniquely results in liquefactive necrosis due to abundant hydrolytic enzymes released by microglial cells.'
        }
      },
      {
        id: 'path_mod_2',
        title: 'Acute vs Chronic Inflammation & Tissue Repair',
        duration: '31 mins',
        completed: false,
        visualizerType: 'cellular_pathology',
        youtubeId: '8JH64P-RHCU',
        objectives: [
          'Trace neutrophil extravasation: Margination, rolling, adhesion, transmigration',
          'Understand mediator cascades: Histamine, prostaglandins, leukotrienes, and cytokines (IL-1, TNF-alpha)',
          'Identify granulomatous inflammation morphology and Langhans giant cells'
        ],
        keyPoints: [
          'Leukocyte rolling utilizes Selectins (E-selectin, P-selectin); stable arrest utilizes Integrins (ICAM-1/VCAM-1).',
          'PGE2 mediates fever and pain sensation at the hypothalamus.',
          'Caseating granulomas (central necrosis surrounded by epithelioid histiocytes and multinucleated giant cells) are the hallmark of Tuberculosis.'
        ],
        timestamps: [
          { time: '00:00', label: 'Vascular & Cellular Events in Acute Inflammation' },
          { time: '06:58', label: 'Leukocyte Adhesion Cascade' },
          { time: '13:57', label: 'Chemical Mediators of Inflammation' },
          { time: '20:55', label: 'Granuloma Formation Mechanisms' },
          { time: '27:54', label: 'Wound Healing: Granulation Tissue to Scar' }
        ],
        quiz: {
          question: 'Deficiency of which molecule leads to Leukocyte Adhesion Deficiency Type 1 (LAD-1)?',
          options: ['Sialyl Lewis X', 'CD18 beta-2 integrin', 'P-selectin', 'Myeloperoxidase'],
          answer: 1,
          explanation: 'LAD-1 is an autosomal recessive defect in CD18 (beta-2 integrin subunit), preventing firm adhesion and transmigration of neutrophils into infected tissues.'
        }
      },
      {
        id: 'path_mod_3',
        title: 'Neoplasia, Hallmarks of Cancer & Tumor Staging',
        duration: '15 mins',
        completed: false,
        visualizerType: 'cellular_pathology',
        youtubeId: 'M7lc1UVf-VE',
        objectives: [
          'Review Hanahan & Weinberg 10 Hallmarks of Cancer',
          'Differentiate oncogenes (RAS, MYC, ERBB2) from tumor suppressors (TP53, RB1, APC)',
          'Compare histologic grading (differentiation) vs clinical staging (TNM)'
        ],
        keyPoints: [
          'TP53 guardian of the genome arrests cell cycle at G1/S via p21 induction upon DNA damage.',
          'Knudson two-hit hypothesis governs hereditary tumor suppressors like Retinoblastoma (RB1).',
          'Staging (TNM: Tumor size, Node spread, Metastasis) is the single most significant prognostic factor for most solid malignancies.'
        ],
        timestamps: [
          { time: '00:00', label: 'Benign vs Malignant Characteristics' },
          { time: '03:22', label: 'Proto-oncogenes vs Tumor Suppressors' },
          { time: '06:45', label: 'Telomerase & Replicative Immortality' },
          { time: '10:07', label: 'Invasion and Metastatic Cascade' },
          { time: '13:30', label: 'TNM Staging Systems & Pathologic Reporting' }
        ],
        quiz: {
          question: 'What is the most critical prognostic factor determining survival in invasive breast carcinoma?',
          options: ['Histologic tumor grade', 'Axillary lymph node status (Staging)', 'Estrogen receptor positivity', 'Ki-67 proliferation index'],
          answer: 1,
          explanation: 'While tumor biology and grade matter, the clinical and pathologic stage (especially axillary lymph node involvement) is the strongest overall prognostic indicator.'
        }
      },
      {
        id: 'path_mod_4',
        title: 'Hemodynamic Disorders: Thromboembolism, Infarction & Shock',
        duration: '27 mins',
        completed: false,
        visualizerType: 'cardiac_ekg',
        youtubeId: 'mS80b5ICPhM',
        objectives: [
          'Analyze Virchow Triad: Endothelial injury, stasis/turbulence, hypercoagulability',
          'Identify pulmonary embolism hemodynamics and saddle embolus presentation',
          'Differentiate Hypovolemic, Cardiogenic, Septic, and Neurogenic shock profiles'
        ],
        keyPoints: [
          'Lines of Zahn represent alternating layers of platelets/fibrin and RBCs, confirming a thrombus formed in flowing blood prior to death.',
          'Septic shock exhibits warm extremities early with low systemic vascular resistance (SVR) and high cardiac output, unlike cardiogenic shock.',
          'Factor V Leiden (resistance to activated Protein C) is the most common inherited thrombophilia in Caucasian populations.'
        ],
        timestamps: [
          { time: '00:00', label: 'Normal Hemostasis vs Thrombosis' },
          { time: '06:04', label: 'Virchow Triad Deep Dive' },
          { time: '12:09', label: 'Embolism Types: Thrombus, Fat, Amniotic Fluid, Air' },
          { time: '18:13', label: 'Hemodynamic Parameters Across Shock States' },
          { time: '24:18', label: 'Clinical Vignette & Management Protocol' }
        ],
        quiz: {
          question: 'A patient in shock has LOW cardiac output, HIGH systemic vascular resistance, and HIGH pulmonary capillary wedge pressure. What type of shock is present?',
          options: ['Septic shock', 'Cardiogenic shock', 'Hypovolemic shock', 'Anaphylactic shock'],
          answer: 1,
          explanation: 'Cardiogenic shock is characterized by pump failure resulting in elevated filling pressures (PCWP), decreased cardiac output, and compensatory systemic vasoconstriction (high SVR).'
        }
      }
    ]
  },

  'Clinical Examination': {
    title: 'Clinical Examination',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Dr. Michael Chang, MD, Internal Medicine & Bedside Diagnostic Educator',
    aiSummary: '🤖 AI Summary: Master the essential four pillars of physical examination: Inspection, Palpation, Percussion, and Auscultation. Learn structured cardiovascular, respiratory, abdominal, and neurological assessment protocols.',
    modules: [
      {
        id: 'clin_mod_1',
        title: 'Cardiovascular Examination: Heart Sounds, Murmurs & JVP',
        duration: '8 mins',
        completed: false,
        visualizerType: 'cardiac_ekg',
        youtubeId: 'XU_xeUMJ3Zc',
        objectives: [
          'Accurately measure Jugular Venous Pressure (JVP) and differentiate a, c, and v waves',
          'Auscultate S1, S2, physiologic splitting, S3 gallop, and S4 sound',
          'Distinguish systolic murmurs (Aortic Stenosis, Mitral Regurgitation) from diastolic murmurs'
        ],
        keyPoints: [
          'Normal JVP is <= 3 cm above the sternal angle at 45 degrees. Elevated JVP indicates right ventricular failure or volume overload.',
          'S3 represents rapid passive ventricular filling in early diastole; physiologic in children/athletes, pathologic in systolic heart failure.',
          'Aortic Stenosis produces a harsh crescendo-decrescendo systolic murmur radiating to carotids with delayed carotid upstroke (pulsus parvus et tardus).'
        ],
        timestamps: [
          { time: '00:00', label: 'Patient Positioning & General Inspection' },
          { time: '01:48', label: 'Measuring JVP & Hepatojugular Reflux' },
          { time: '03:36', label: 'Palpation: Point of Maximal Impulse (PMI) & Thrills' },
          { time: '05:24', label: 'Auscultation Areas & Dynamic Maneuvers' },
          { time: '07:12', label: 'Differentiating Systolic vs Diastolic Murmurs' }
        ],
        quiz: {
          question: 'Which auscultatory finding is characterized as a low-pitched early diastolic sound caused by blood sloshing into an overfilled, compliant ventricle?',
          options: ['S1 heart sound', 'S4 heart sound', 'S3 gallop', 'Ejection click'],
          answer: 2,
          explanation: 'An S3 gallop occurs during the rapid filling phase of early diastole and reflects volume overload or decreased ventricular contractility (systolic failure).'
        }
      },
      {
        id: 'clin_mod_2',
        title: 'Respiratory Examination: Chest Expansion, Percussion & Breath Sounds',
        duration: '10 mins',
        completed: false,
        visualizerType: 'radiology_cxr',
        youtubeId: 'q6w3CClfhdk',
        objectives: [
          'Assess thoracic expansion symmetry and tactile vocal fremitus',
          'Contrast resonant, hyperresonant, and dull percussion notes',
          'Interpret vesicular breath sounds, bronchial breathing, wheezes, and crackles'
        ],
        keyPoints: [
          'Dullness to percussion + Increased tactile fremitus = Consolidation (Lobar Pneumonia).',
          'Dullness to percussion + Decreased tactile fremitus = Pleural Effusion (fluid insulates sound).',
          'Hyperresonance + Absent breath sounds = Pneumothorax.'
        ],
        timestamps: [
          { time: '00:00', label: 'Thoracic Inspection: Rate, Depth & Accessory Muscles' },
          { time: '02:15', label: 'Tactile Fremitus & Chest Expansion Test' },
          { time: '04:30', label: 'Comparative Percussion: Resonant vs Dull' },
          { time: '06:45', label: 'Auscultation: Vesicular vs Bronchial Breath Sounds' },
          { time: '09:00', label: 'Adventitious Sounds: Crackles, Stridor & Wheezes' }
        ],
        quiz: {
          question: 'A 60-year-old patient has dullness to percussion at the right lung base with markedly INCREASED tactile vocal fremitus. What is the diagnosis?',
          options: ['Right pleural effusion', 'Right lobar pneumonia (consolidation)', 'Right pneumothorax', 'COPD emphysema'],
          answer: 1,
          explanation: 'Consolidated lung tissue transmits sound vibrations better than aerated lung, resulting in increased tactile fremitus combined with a dull percussion note.'
        }
      },
      {
        id: 'clin_mod_3',
        title: 'Abdominal Examination: Palpation, Organomegaly & Peritoneal Signs',
        duration: '8 mins',
        completed: false,
        visualizerType: 'radiology_cxr',
        youtubeId: 'PYAnF6GJY2I',
        objectives: [
          'Follow the strict sequence: Inspection, Auscultation, Percussion, Palpation',
          'Differentiate voluntary guarding from involuntary rigidity',
          'Perform specialized peritoneal signs: McBurney tenderness, Rovsing, Psoas, and Murphy sign'
        ],
        keyPoints: [
          'Always auscultate before palpation or percussion to avoid altering bowel sound frequency.',
          'Murphy sign (arrest of inspiration upon palpation of right upper quadrant) is positive in acute cholecystitis.',
          'Rebound tenderness (Blumberg sign) and involuntary abdominal rigidity indicate parietal peritoneal inflammation requiring surgical evaluation.'
        ],
        timestamps: [
          { time: '00:00', label: 'Inspection: Distension, Scars & Striae' },
          { time: '01:48', label: 'Auscultation: Bowel Sounds & Bruits' },
          { time: '03:36', label: 'Light vs Deep Palpation Techniques' },
          { time: '05:24', label: 'Assessing Hepatomegaly & Splenomegaly' },
          { time: '07:12', label: 'Acute Abdomen Maneuvers: Appendicitis & Cholecystitis' }
        ],
        quiz: {
          question: 'Which clinical test produces pain in the right lower quadrant when palpating the left lower quadrant?',
          options: ['Murphy sign', 'Rovsing sign', 'Obturator sign', 'Cullen sign'],
          answer: 1,
          explanation: 'Rovsing sign is positive in acute appendicitis when palpation of the left lower quadrant stretches the peritoneal lining, eliciting pain in the right lower quadrant.'
        }
      },
      {
        id: 'clin_mod_4',
        title: 'Neurological Examination: Cranial Nerves, Motor & Sensory Pathways',
        duration: '20 mins',
        completed: false,
        visualizerType: 'anatomy_3d',
        youtubeId: 'PEJJv3gJh74',
        objectives: [
          'Systematically test Cranial Nerves I through XII',
          'Distinguish Upper Motor Neuron (UMN) vs Lower Motor Neuron (LMN) lesions',
          'Evaluate deep tendon reflexes (0-4+ scale) and Babinski response'
        ],
        keyPoints: [
          'UMN lesions: Spastic paralysis, hyperreflexia, hypertonia, positive Babinski sign (extensor plantar response).',
          'LMN lesions: Flaccid paralysis, hyporeflexia, fasciculations, muscle atrophy.',
          'Cranial Nerve VII palsy: Forehead involvement distinguishes Bell palsy (LMN) from a stroke (UMN, which spares forehead due to bilateral cortical innervation).'
        ],
        timestamps: [
          { time: '00:00', label: 'Mental Status & Cranial Nerves I to VI' },
          { time: '04:30', label: 'Cranial Nerves VII to XII' },
          { time: '09:00', label: 'Motor System: Tone, Bulk & Power (0-5 Medical Research Council)' },
          { time: '13:30', label: 'Deep Tendon Reflexes & Clonus Testing' },
          { time: '18:00', label: 'Sensory Testing (Dermatomes, Vibration, Proprioception)' }
        ],
        quiz: {
          question: 'A patient presents with right facial weakness. On examination, they cannot wrinkle their right forehead or close their right eye. Where is the lesion?',
          options: ['Left motor cortex (UMN)', 'Right facial nerve (CN VII, LMN)', 'Right motor cortex (UMN)', 'Brainstem medial longitudinal fasciculus'],
          answer: 1,
          explanation: 'Involvement of both the upper and lower face (including inability to wrinkle the forehead) indicates a lower motor neuron lesion of CN VII (such as Bell palsy).'
        }
      }
    ]
  },

  'Radiology Basics': {
    title: 'Radiology Basics',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Dr. Sarah Lin, MD, Diagnostic & Emergency Radiologist',
    aiSummary: '🤖 AI Summary: Systematic image reading protocols for plain radiographs, emergency head CTs, and ultrasound. Master the ABCDE chest X-ray interpretation method and identify acute emergencies with high sensitivity.',
    modules: [
      {
        id: 'rad_mod_1',
        title: 'Chest Radiograph (CXR): The Systematic ABCDE Method',
        duration: '23 mins',
        completed: false,
        visualizerType: 'radiology_cxr',
        youtubeId: 'e39pLXGjNbA',
        objectives: [
          'Confirm technical adequacy: Rotation, Inspiration (9-10 ribs), Penetration',
          'Follow ABCDE: Airway, Breathing, Cardiac silhouette, Diaphragm, Everything else',
          'Identify silhouette sign and distinguish alveolar vs interstitial patterns'
        ],
        keyPoints: [
          'Adequate inspiration: At least 9 posterior ribs or 6 anterior ribs should be visible above the diaphragm.',
          'Silhouette sign: Loss of normal anatomic border occurs when adjacent lung tissue becomes fluid-filled (consolidated).',
          'Cardiothoracic ratio (CTR): On a PA film, heart diameter should be <= 50% of the internal thoracic diameter.'
        ],
        timestamps: [
          { time: '00:00', label: 'Image Orientation & Quality Verification (R.I.P)' },
          { time: '05:10', label: 'A: Airway & Tracheal Alignment' },
          { time: '15:31', label: 'B: Breathing & Lung Field Zones' },
          { time: '10:20', label: 'C: Cardiac Contours & Mediastinal Width' },
          { time: '20:41', label: 'D & E: Diaphragm, Costophrenic Angles & Soft Tissues' }
        ],
        quiz: {
          question: 'Loss of the right heart border on a PA chest radiograph indicates consolidation in which lung lobe?',
          options: ['Right upper lobe', 'Right middle lobe', 'Right lower lobe', 'Lingula'],
          answer: 1,
          explanation: 'The right middle lobe lies anatomically adjacent to the right atrium (right heart border). Fluid in the right middle lobe obscures this border (positive silhouette sign).'
        }
      },
      {
        id: 'rad_mod_2',
        title: 'Emergency Head CT: Stroke, Hemorrhage & Midline Shift',
        duration: '24 mins',
        completed: false,
        visualizerType: 'radiology_cxr',
        youtubeId: 'iPxKmZFvbzM',
        objectives: [
          'Differentiate acute blood (hyperdense/white) from CSF and brain parenchyma',
          'Compare Epidural, Subdural, and Subarachnoid hemorrhages',
          'Recognize early ischemic stroke signs: Hyperdense MCA sign and loss of insular ribbon'
        ],
        keyPoints: [
          'Epidural Hematoma: Lenticular (biconvex) hyperdensity, does NOT cross suture lines; rupture of Middle Meningeal Artery.',
          'Subdural Hematoma: Crescent-shaped hyperdensity crossing suture lines; rupture of bridging cortical veins.',
          'Subarachnoid Hemorrhage: Hyperdense blood in basal cisterns and sulci; often secondary to ruptured berry aneurysm.'
        ],
        timestamps: [
          { time: '00:00', label: 'Hounsfield Units & CT Density Basics' },
          { time: '05:24', label: 'Acute Intracranial Hemorrhage Comparison' },
          { time: '10:48', label: 'Mass Effect, Midline Shift & Herniation Syndromes' },
          { time: '16:12', label: 'Early Signs of Acute Ischemic Stroke' },
          { time: '21:36', label: 'Interactive CT Slice Review' }
        ],
        quiz: {
          question: 'A trauma patient has a biconvex, lenticular hyperdensity on non-contrast head CT that does not cross cranial suture lines. What is the diagnosis?',
          options: ['Subdural hematoma', 'Epidural hematoma', 'Subarachnoid hemorrhage', 'Intraparenchymal contusion'],
          answer: 1,
          explanation: 'Epidural hematomas are arterial in origin (middle meningeal artery) and form a biconvex/lens-shaped collection limited by the cranial suture lines where the dura attaches firmly to skull.'
        }
      },
      {
        id: 'rad_mod_3',
        title: 'Abdominal Radiographs: Bowel Gas Patterns, Obstruction & Free Air',
        duration: '19 mins',
        completed: false,
        visualizerType: 'radiology_cxr',
        youtubeId: '_o5WFhvf9y4',
        objectives: [
          'Apply the 3-6-9 rule for normal bowel caliber',
          'Spot small bowel obstruction (stacked coin/valvulae conniventes and air-fluid levels)',
          'Detect pneumoperitoneum (Rigler sign, crescent of free air under diaphragm)'
        ],
        keyPoints: [
          '3-6-9 rule: Maximum normal caliber is 3 cm for small bowel, 6 cm for colon, and 9 cm for cecum.',
          'Rigler sign (double wall sign): Visualization of both the inner and outer walls of a bowel loop indicates free extraluminal intraperitoneal air.',
          'Sigmoid volvulus displays a classic "coffee bean" sign pointing toward the right upper quadrant.'
        ],
        timestamps: [
          { time: '00:00', label: 'Erect vs Supine Abdominal Views' },
          { time: '04:16', label: 'Normal Gas Distribution vs 3-6-9 Rule' },
          { time: '08:33', label: 'Small Bowel vs Large Bowel Obstruction Patterns' },
          { time: '12:49', label: 'Pneumoperitoneum: The Sign of Viscus Perforation' },
          { time: '17:06', label: 'Volvulus and Toxic Megacolon Signs' }
        ],
        quiz: {
          question: 'An erect chest radiograph reveals a thin crescent of radiolucency under the right hemidiaphragm in an acute abdomen patient. What is the emergency?',
          options: ['Acute pancreatitis', 'Pneumoperitoneum (perforated viscus)', 'Diaphragmatic hernia', 'Subphrenic abscess'],
          answer: 1,
          explanation: 'Free air under the diaphragm on an upright film confirms pneumoperitoneum, most commonly caused by a perforated peptic ulcer or gastrointestinal viscus, requiring urgent laparotomy.'
        }
      },
      {
        id: 'rad_mod_4',
        title: 'Musculoskeletal Imaging: Fracture Evaluation & Pediatric Pitfalls',
        duration: '61 mins',
        completed: false,
        visualizerType: 'radiology_cxr',
        youtubeId: 'XAj164a8wLc',
        objectives: [
          'Standardize fracture description: Location, orientation, displacement, angulation, shortening',
          'Identify subtle elbow injuries via anterior and posterior fat pad signs',
          'Classify pediatric physeal fractures using the Salter-Harris framework'
        ],
        keyPoints: [
          'Always obtain at least two orthogonal projections (AP and Lateral) and image the joints above and below.',
          'A posterior fat pad sign on a lateral elbow radiograph is always pathologic, indicating occult intra-articular fracture.',
          'Salter-Harris Type II (through physis and metaphysis) is the most common pediatric growth plate fracture.'
        ],
        timestamps: [
          { time: '00:00', label: 'Orthogonal Projections & Principles' },
          { time: '13:43', label: 'Describing Fractures with Precision' },
          { time: '27:26', label: 'Occult Fractures & Joint Effusion Fat Pad Signs' },
          { time: '41:10', label: 'Salter-Harris Pediatric Growth Plate Classification' },
          { time: '54:53', label: 'High-Yield Clinical Case Review' }
        ],
        quiz: {
          question: 'Which sign on a lateral pediatric elbow radiograph is strongly suggestive of an occult supracondylar fracture even when no cortical break is visible?',
          options: ['Anterior humeral line passing through center of capitellum', 'Posterior fat pad sign', 'Radial head dislocation', 'Cortical step-off at olecranon'],
          answer: 1,
          explanation: 'The posterior fat pad is normally hidden within the olecranon fossa. Its visualization on a lateral view confirms joint hemarthrosis, in children most commonly due to a nondisplaced supracondylar fracture.'
        }
      }
    ]
  },

  'Emergency Medicine': {
    title: 'Emergency Medicine',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Dr. Marcus Vance, MD, FACEP, Trauma & Critical Care Specialist',
    aiSummary: '🤖 AI Summary: High-stakes clinical protocols for rapid resuscitation, advanced airway management, acute coronary syndromes, polytrauma primary survey, and septic shock stabilization.',
    modules: [
      {
        id: 'em_mod_1',
        title: 'Advanced Cardiac Life Support (ACLS) & Resuscitation Protocols',
        duration: '82 mins',
        completed: false,
        visualizerType: 'acls_resuscitation',
        youtubeId: 'nfPss8VAS8c',
        objectives: [
          'Master shockable rhythms (VF/pVT) vs non-shockable rhythms (Asystole/PEA)',
          'Integrate high-quality CPR metrics (100-120 bpm, 5-6 cm depth, complete recoil)',
          'Systematically diagnose and reverse the Hs and Ts of cardiac arrest'
        ],
        keyPoints: [
          'Defibrillation (unsynchronized shock) is indicated ONLY for VF and pulseless VT.',
          'Epinephrine 1 mg IV every 3-5 minutes is the cornerstone vasopressor in arrest.',
          'Amiodarone (300 mg first bolus, 150 mg second) or Lidocaine for refractory VF/pVT.',
          'The reversible Hs and Ts: Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/hyperkalemia, Hypothermia, Tension pneumothorax, Tamponade, Toxins, Thrombosis (coronary/pulmonary).'
        ],
        timestamps: [
          { time: '00:00', label: 'Immediate Arrest Recognition & CPR Quality' },
          { time: '18:26', label: 'VF/pVT Shockable Pathway & Energy Selection' },
          { time: '36:53', label: 'PEA/Asystole Algorithm & Early Epinephrine' },
          { time: '55:20', label: 'The Reversible Hs and Ts Differential' },
          { time: '73:47', label: 'Post-Cardiac Arrest Care (TTM & Coronary Angiography)' }
        ],
        quiz: {
          question: 'A 54-year-old male in cardiac arrest displays Ventricular Fibrillation on the monitor. After a shock is delivered, what is the immediate next step?',
          options: ['Check carotid pulse', 'Analyze the rhythm on monitor', 'Resume high-quality chest compressions immediately', 'Administer 1 mg Epinephrine IV'],
          answer: 2,
          explanation: 'Immediately resume CPR for 2 full minutes after shock delivery without pausing for a rhythm or pulse check. Delaying compressions decreases perfusion and survival.'
        }
      },
      {
        id: 'em_mod_2',
        title: 'Acute Coronary Syndromes (ACS): STEMI vs NSTEMI Protocols',
        duration: '22 mins',
        completed: false,
        visualizerType: 'cardiac_ekg',
        youtubeId: 'HSbYKBRsxYI',
        objectives: [
          'Recognize STEMI criteria: >= 1 mm ST elevation in 2 contiguous leads',
          'Localize myocardial infarctions: Anterior (LAD), Inferior (RCA), Lateral (LCx)',
          'Enforce door-to-balloon time <= 90 mins for primary percutaneous coronary intervention (PCI)'
        ],
        keyPoints: [
          'Immediate medical therapy: Aspirin 325 mg chewed, P2Y12 inhibitor (Ticagrelor/Clopidogrel), unfractionated heparin, and sublingual nitroglycerin (if no right ventricular infarct).',
          'Nitrates are STRICTLY CONTRAINDICATED in inferior STEMI with right ventricular involvement (leads II, III, aVF with ST elevation in V4R) and recent PDE-5 inhibitor use.',
          'High-sensitivity Troponin elevation confirms myocardial necrosis in NSTEMI.'
        ],
        timestamps: [
          { time: '00:00', label: 'Initial 10-Minute Assessment & ECG Strategy' },
          { time: '04:57', label: 'ECG Localization & Reciprocal Changes' },
          { time: '09:54', label: 'Right Ventricular & Posterior MI Identification' },
          { time: '14:51', label: 'Emergency Pharmacotherapy Regimens' },
          { time: '19:48', label: 'PCI vs Fibrinolytic Decision Pathways' }
        ],
        quiz: {
          question: 'An ECG demonstrates 2 mm ST elevation in leads II, III, and aVF with reciprocal depression in I and aVL. Which coronary artery is occluded?',
          options: ['Left Anterior Descending (LAD)', 'Left Circumflex (LCx)', 'Right Coronary Artery (RCA)', 'Left Main Coronary Artery'],
          answer: 2,
          explanation: 'Leads II, III, and aVF evaluate the inferior myocardial wall, which is supplied by the Right Coronary Artery (RCA) in 85-90% of individuals.'
        }
      },
      {
        id: 'em_mod_3',
        title: 'Trauma Resuscitation & The ATLS Primary Survey (ABCDE)',
        duration: '52 mins',
        completed: false,
        visualizerType: 'acls_resuscitation',
        youtubeId: 'MH3RpYUfFwY',
        objectives: [
          'Execute ATLS Primary Survey: Airway with C-spine, Breathing, Circulation, Disability, Exposure',
          'Detect and decompress life threats: Tension pneumothorax, open pneumothorax, cardiac tamponade',
          'Utilize Massive Transfusion Protocol (1:1:1 balanced ratio of PRBCs, FFP, Platelets)'
        ],
        keyPoints: [
          'Airway with Cervical Spine Protection: Jaw thrust maneuver, in-line stabilization, avoid head-tilt.',
          'Tension pneumothorax is a CLINICAL diagnosis; do not delay decompression for a chest X-ray. Decompress at 4th/5th intercostal space anterior axillary line.',
          'Beck Triad of Cardiac Tamponade: Hypotension, JVD, muffled heart sounds. Immediate pericardiocentesis indicated.'
        ],
        timestamps: [
          { time: '00:00', label: 'Philosophy of the Trauma Primary Survey' },
          { time: '11:42', label: 'A & B: Airway Control & Immediate Torso Decompression' },
          { time: '23:24', label: 'C: Hemorrhage Control & 1:1:1 Balanced Resuscitation' },
          { time: '35:06', label: 'FAST Exam (Focused Assessment with Sonography for Trauma)' },
          { time: '46:48', label: 'D & E: Glasgow Coma Scale & Hypothermia Prevention' }
        ],
        quiz: {
          question: 'A trauma patient has severe hypotension, distended neck veins, and tracheal deviation to the left with absent breath sounds on the right. What is the immediate treatment?',
          options: ['Emergent endotracheal intubation', 'Stat portable chest radiograph', 'Needle or finger thoracostomy in the right chest', 'Pericardiocentesis'],
          answer: 2,
          explanation: 'This presentation represents a right-sided tension pneumothorax. Needle or finger thoracostomy decompression must be performed immediately without waiting for imaging.'
        }
      },
      {
        id: 'em_mod_4',
        title: 'Sepsis, Anaphylaxis & Toxicology Emergencies',
        duration: '8 mins',
        completed: false,
        visualizerType: 'drug_receptor',
        youtubeId: 'Rxr1x25kAbs',
        objectives: [
          'Implement the 1-Hour Sepsis Bundle: Blood cultures, broad antibiotics, lactate, 30 mL/kg crystalloid',
          'First-line management of Anaphylaxis: Epinephrine 0.3-0.5 mg IM (1:1000) mid-anterolateral thigh',
          'Recognize critical toxidromes: Anticholinergic, Cholinergic, Opioid, and Sympathomimetic'
        ],
        keyPoints: [
          'Anaphylaxis first-line treatment is IM EPINEPHRINE without delay; antihistamines and steroids are secondary adjuncts.',
          'Sepsis refractory to 30 mL/kg fluid resuscitation requires Norepinephrine as the first-line vasopressor to maintain MAP >= 65 mmHg.',
          'Opioid overdose triad: CNS depression, respiratory depression, miosis. Reversal with IV/IN Naloxone.'
        ],
        timestamps: [
          { time: '00:00', label: 'Surviving Sepsis Campaign 1-Hour Bundle' },
          { time: '01:48', label: 'Anaphylaxis Diagnostic Criteria & Epinephrine Dosing' },
          { time: '03:36', label: 'Differentiating Sympathomimetic vs Anticholinergic Toxidromes' },
          { time: '05:24', label: 'Specific Antidotes (Naloxone, N-acetylcysteine, Atropine)' },
          { time: '07:12', label: 'High-Yield Board Review Questions' }
        ],
        quiz: {
          question: 'What is the immediate drug, dose, and route of choice for a patient experiencing acute anaphylactic shock with stridor?',
          options: ['Diphenhydramine 50 mg IV', 'Epinephrine 0.3 mg IM (1:1,000) into lateral thigh', 'Methylprednisolone 125 mg IV', 'Epinephrine 1 mg IV (1:10,000) push'],
          answer: 1,
          explanation: 'Intramuscular Epinephrine 0.3-0.5 mg (1:1,000 dilution) injected into the anterolateral thigh is the first-line life-saving treatment for anaphylaxis.'
        }
      }
    ]
  },

  'Anatomy': {
    title: 'Anatomy',
    domain: 'MEDICAL',
    category: 'Preclinical',
    instructor: 'Dr. Emily Rose, MD, Clinical Anatomist & Surgeon',
    aiSummary: '🤖 AI Summary: High-yield regional human anatomy with focus on neurovascular bundles, surgical landmarks, cranial nerve courses, and clinical injury correlations.',
    modules: [
      {
        id: 'anat_mod_1',
        title: 'Thoracic Cavity: Cardiovascular, Pulmonary & Mediastinal Anatomy',
        duration: '8 mins',
        completed: false,
        visualizerType: 'anatomy_3d',
        youtubeId: 'AqEA61efyYs',
        objectives: [
          'Map superior, anterior, middle, and posterior mediastinal compartments',
          'Trace the aortic arch branching: Brachiocephalic, Left Common Carotid, Left Subclavian',
          'Analyze recurrent laryngeal nerve pathways around aortic arch and subclavian artery'
        ],
        keyPoints: [
          'The Left Recurrent Laryngeal Nerve loops under the aortic arch at ligamentum arteriosum; mediastinal lymphadenopathy causes hoarseness.',
          'The Phrenic Nerve (C3-C5) passes anterior to the anterior scalene muscle and descends on pericardium.',
          'Coronary dominance is determined by which vessel gives off the Posterior Descending Artery (PDA).'
        ],
        timestamps: [
          { time: '00:00', label: 'Thoracic Wall & Intercostal Neurovascular Bundle' },
          { time: '01:48', label: 'Mediastinal Compartments & Masses' },
          { time: '03:36', label: 'Great Vessels & Aortic Arch Anatomy' },
          { time: '05:24', label: 'Pericardium & Cardiac Chambers' },
          { time: '07:12', label: 'Clinical Scenarios: Pneumothorax & Cardiac Tamponade' }
        ],
        quiz: {
          question: 'Where is the intercostal neurovascular bundle located relative to each rib?',
          options: ['Superior border of each rib', 'Inferior border in the subcostal groove', 'Middle of the intercostal space', 'Anterior surface of the rib'],
          answer: 1,
          explanation: 'The intercostal vein, artery, and nerve (VAN) travel in the subcostal groove along the INFERIOR border of each rib. Thoracentesis is therefore performed above the rib.'
        }
      },
      {
        id: 'anat_mod_2',
        title: 'Neuroanatomy: Brainstem, Cranial Nerves & Circle of Willis',
        duration: '27 mins',
        completed: false,
        visualizerType: 'anatomy_3d',
        youtubeId: 'gvX5ao5SCjE',
        objectives: [
          'Correlate Midbrain (CN III, IV), Pons (CN V, VI, VII, VIII), and Medulla (CN IX, X, XI, XII)',
          'Trace the anterior and posterior arterial circulation of the Circle of Willis',
          'Distinguish lateral medullary (Wallenberg) vs medial medullary stroke syndromes'
        ],
        keyPoints: [
          'Aneurysms of Posterior Communicating Artery (PCom) compress CN III, causing ipsilateral mydriasis and "down and out" gaze.',
          'Wallenberg Syndrome (PICA occlusion): Dysphagia, hoarseness (nucleus ambiguus), ipsilateral Horner syndrome, and loss of pain/temp on ipsilateral face and contralateral body.',
          'Cerebrospinal fluid flows from lateral ventricles -> Foramen of Monro -> Third ventricle -> Cerebral Aqueduct -> Fourth ventricle -> Foramina of Luschka/Magendie.'
        ],
        timestamps: [
          { time: '00:00', label: 'Gross Brain Anatomy & Meningeal Layers' },
          { time: '06:04', label: 'Brainstem Cross-Sections & Cranial Nerve Nuclei' },
          { time: '12:09', label: 'Circle of Willis Vascular Anatomy' },
          { time: '18:13', label: 'Brainstem Stroke Syndromes (Wallenberg vs Weber)' },
          { time: '24:18', label: 'Clinical Case Examination' }
        ],
        quiz: {
          question: 'Compression of which cranial nerve by an enlarging posterior communicating artery aneurysm causes pupillary dilation (mydriasis) and ptosis?',
          options: ['Oculomotor Nerve (CN III)', 'Trochlear Nerve (CN IV)', 'Abducens Nerve (CN VI)', 'Optic Nerve (CN II)'],
          answer: 0,
          explanation: 'Parasympathetic fibers responsible for pupillary constriction travel on the outer perimeter of CN III, making them exquisitely sensitive to external compression by a PCom aneurysm.'
        }
      },
      {
        id: 'anat_mod_3',
        title: 'Upper & Lower Limb Anatomy: Nerves, Plexuses & Fractures',
        duration: '22 mins',
        completed: false,
        visualizerType: 'anatomy_3d',
        youtubeId: 'o8-jI-TX0nI',
        objectives: [
          'Deconstruct Brachial Plexus: Roots, Trunks, Divisions, Cords, Terminal Branches',
          'Correlate upper limb nerve deficits: Radial (wrist drop), Median (ape hand/carpal tunnel), Ulnar (claw hand)',
          'Evaluate lower limb injuries: Common fibular nerve (foot drop) and compartment syndrome'
        ],
        keyPoints: [
          'Radial nerve travels in the spiral groove of the humerus; midshaft humerus fractures result in wrist drop.',
          'Surgical neck of humerus fracture injures the Axillary nerve (deltoid atrophy, loss of sensation over lateral shoulder).',
          'Common Fibular (Peroneal) nerve winds around the fibular neck; trauma causes loss of eversion/dorsiflexion (foot drop).'
        ],
        timestamps: [
          { time: '00:00', label: 'Brachial Plexus Architecture (C5-T1)' },
          { time: '04:57', label: 'Upper Limb Motor & Sensory Deficits' },
          { time: '09:54', label: 'Carpal Tunnel & Hand Spaces' },
          { time: '14:51', label: 'Lumbosacral Plexus & Lower Limb Nerves' },
          { time: '19:48', label: 'Fracture Correlations: Humerus, Hip & Fibula' }
        ],
        quiz: {
          question: 'A patient with a fracture of the neck of the fibula is unable to dorsiflex their foot and has numbness over the dorsum of the foot. Which nerve is injured?',
          options: ['Tibial nerve', 'Common fibular (peroneal) nerve', 'Femoral nerve', 'Obturator nerve'],
          answer: 1,
          explanation: 'The common fibular nerve wraps around the neck of the fibula. Damage causes paralysis of the anterior and lateral compartment leg muscles, producing classic foot drop.'
        }
      },
      {
        id: 'anat_mod_4',
        title: 'Abdominopelvic Cavity: Peritoneal Spaces & Retroperitoneum',
        duration: '6 mins',
        completed: false,
        visualizerType: 'radiology_cxr',
        youtubeId: 'yLX6YUtVRxs',
        objectives: [
          'Differentiate intraperitoneal from retroperitoneal structures (SAD PUCKER mnemonic)',
          'Map arterial blood supply: Celiac Trunk, Superior Mesenteric Artery, Inferior Mesenteric Artery',
          'Analyze the inguinal canal and distinguish direct vs indirect inguinal hernias'
        ],
        keyPoints: [
          'Retroperitoneal organs (SAD PUCKER): Suprarenal glands, Aorta/IVC, Duodenum (2nd-4th), Pancreas (head/body), Ureters, Colon (ascending/descending), Kidneys, Esophagus, Rectum.',
          'Indirect inguinal hernia: Passes through deep internal inguinal ring LATERAL to inferior epigastric vessels into scrotum.',
          'Direct inguinal hernia: Protrudes through Hesselbach triangle MEDIAL to inferior epigastric vessels.'
        ],
        timestamps: [
          { time: '00:00', label: 'Peritoneal Reflections, Greater & Lesser Omentum' },
          { time: '01:21', label: 'Retroperitoneal Spaces & Clinical Implications' },
          { time: '02:42', label: 'Foregut, Midgut & Hindgut Blood Supply' },
          { time: '04:03', label: 'Inguinal Canal Anatomy & Hernia Differentiation' },
          { time: '05:24', label: 'Pelvic Floor & Perineum Summary' }
        ],
        quiz: {
          question: 'Which vessel serves as the anatomical landmark to distinguish an indirect inguinal hernia from a direct inguinal hernia?',
          options: ['Femoral artery', 'Inferior epigastric vessels', 'Deep circumflex iliac artery', 'External iliac vein'],
          answer: 1,
          explanation: 'Indirect hernias pass lateral to the inferior epigastric vessels through the deep ring, whereas direct hernias protrude medial to the inferior epigastric vessels through Hesselbach triangle.'
        }
      }
    ]
  },

  // ==========================================
  // ENGINEERING COURSES (100% SEPARATE FROM MEDICAL)
  // ==========================================
  'React.js & Ecosystem': {
    title: 'React.js & Ecosystem',
    domain: 'ENGINEERING',
    category: 'Software Engineering',
    instructor: 'Dan Abramov & freeCodeCamp Open Source Community',
    aiSummary: '🤖 AI Summary: Master modern React 19, functional components, hooks (useState, useEffect, useMemo, useCallback), Context API, component composition, and full-stack performance optimization.',
    modules: [
      {
        id: 'react_mod_1',
        title: 'React Foundations: Components, JSX & Virtual DOM Architecture',
        duration: '26 mins',
        completed: false,
        youtubeId: 'OaI-JPy5Vn4',
        objectives: [
          'Master JSX syntax, declarative rendering, and unidirectional data flow',
          'Understand how the Virtual DOM uses fiber reconciliation to minimize reflows',
          'Deconstruct React components into reusable, modular presentation units'
        ],
        keyPoints: [
          'JSX compiles directly into React.createElement calls via Babel/SWC.',
          'React Fiber is an asynchronous reconciliation engine that enables interruptible rendering and priority scheduling.',
          'Always use stable, unique keys on list items to preserve component state across re-renders.'
        ],
        codeSnippet: `// Custom Hook: useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
        timestamps: [
          { time: '00:00', label: 'Course Overview & Environment Setup' },
          { time: '05:51', label: 'JSX Syntax & Expressions' },
          { time: '11:42', label: 'Functional Components & Props' },
          { time: '17:33', label: 'Rendering Lists & Key Stability' },
          { time: '23:24', label: 'Virtual DOM Reconciliation Summary' }
        ],
        quiz: {
          question: 'Why should you avoid using array index as a key in dynamic lists in React?',
          options: [
            'It decreases JavaScript engine execution speed',
            'It can cause component state corruption and improper re-ordering during item insertions/deletions',
            'React throws a compilation error when using numerical keys',
            'Indices cannot be read by browser accessibility screen readers'
          ],
          answer: 1,
          explanation: 'Using indices as keys breaks component identity when items are added, removed, or reordered, leading to subtle state bugs and unnecessary re-renders.'
        }
      },
      {
        id: 'react_mod_2',
        title: 'State Management, Lifecycle & Custom Hooks Mastery',
        duration: '166 mins',
        completed: false,
        youtubeId: '-bEzt5ISACA',
        objectives: [
          'Deep dive into useState, useEffect, and useRef hook mechanics',
          'Prevent common pitfalls: infinite effect loops, stale closures, and memory leaks',
          'Architect custom hooks to decouple business logic from UI rendering'
        ],
        keyPoints: [
          'State updates in React 18+ are automatically batched across all event handlers and promises.',
          'useEffect runs asynchronously AFTER painting; useLayoutEffect runs synchronously BEFORE browser paint.',
          'useRef stores mutable values that persist across renders without triggering a re-render.'
        ],
        codeSnippet: `// Performance optimization with useMemo & useCallback
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

const memoizedResult = useMemo(() => {
  return computeHeavyCalculation(data);
}, [data]);`,
        timestamps: [
          { time: '00:00', label: 'Hook Rules & Closure Mechanics' },
          { time: '37:21', label: 'useEffect Dependency Array Patterns' },
          { time: '74:42', label: 'Cleanup Functions & AbortController' },
          { time: '112:03', label: 'Building Custom Data-Fetching Hooks' },
          { time: '149:24', label: 'Summary & Best Practices' }
        ],
        quiz: {
          question: 'What is the purpose of returning a function inside a useEffect hook?',
          options: [
            'To trigger a mandatory re-render of the parent component',
            'To serve as a cleanup function when the component unmounts or before the effect re-runs',
            'To return the output value of the effect hook',
            'To bind the effect to the global window object'
          ],
          answer: 1,
          explanation: 'The function returned by useEffect is the cleanup mechanism, used to unsubscribe from listeners, cancel timeouts, or abort pending HTTP requests.'
        }
      },
      {
        id: 'react_mod_3',
        title: 'Context API, Performance Tuning & React Compiler',
        duration: '8 mins',
        completed: false,
        youtubeId: 'pncNqiW58Pw',
        objectives: [
          'Manage global application state without prop-drilling using Context API',
          'Profile component renders using React DevTools and memoization techniques',
          'Learn React 19 Actions, useTransition, and useOptimistic paradigms'
        ],
        keyPoints: [
          'React.memo performs shallow prop comparison to skip rendering unchanged trees.',
          'useTransition marks state updates as non-blocking transitions, preserving UI responsiveness.',
          'Avoid premature memoization; optimize component colocation and state derivation first.'
        ],
        codeSnippet: `// Non-blocking state transition
const [isPending, startTransition] = useTransition();

const handleSearch = (e) => {
  const query = e.target.value;
  setSearchInput(query); // urgent update
  startTransition(() => {
    setFilteredList(performExpensiveSearch(query)); // non-blocking
  });
};`,
        timestamps: [
          { time: '00:00', label: 'Context API Architecture' },
          { time: '01:48', label: 'Splitting State & Dispatch Contexts' },
          { time: '03:36', label: 'Profiler & Identifying Wasteful Renders' },
          { time: '05:24', label: 'React 19 useTransition & Optimistic Updates' },
          { time: '07:12', label: 'Production Build Bundling & Tree Shaking' }
        ],
        quiz: {
          question: 'What is the primary benefit of useTransition over standard state updates?',
          options: [
            'It persists state to localStorage automatically',
            'It keeps the UI responsive by allowing urgent updates (like typing) to interrupt slow renders',
            'It runs the calculation inside a background Web Worker',
            'It bypasses React Fiber scheduler completely'
          ],
          answer: 1,
          explanation: 'useTransition marks state transitions as interruptible, ensuring the browser remains fluid for high-priority user interactions.'
        }
      },
      {
        id: 'react_mod_4',
        title: 'Full-Stack Architecture & Modern Routing Paradigms',
        duration: '53 mins',
        completed: false,
        youtubeId: 'F2FmTdLtb_4',
        objectives: [
          'Implement dynamic nested routing with React Router v7',
          'Structure scalable enterprise folder architecture (feature-based)',
          'Integrate client-side caching with TanStack Query (React Query)'
        ],
        keyPoints: [
          'Colocate feature components, hooks, tests, and API clients in modular domains.',
          'Server State (TanStack Query) handles caching, deduplication, and stale-while-revalidate.',
          'Code-splitting with React.lazy and Suspense decreases initial bundle load time.'
        ],
        codeSnippet: `// Dynamic route loader & error boundary
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'dashboard', element: <Dashboard /> }
    ]
  }
]);`,
        timestamps: [
          { time: '00:00', label: 'React Router Architecture' },
          { time: '11:55', label: 'Route Loaders & Actions' },
          { time: '23:51', label: 'Code Splitting with Suspense' },
          { time: '35:46', label: 'Security & CSRF/XSS Protections' },
          { time: '47:42', label: 'Final Engineering Wrap-up' }
        ],
        quiz: {
          question: 'Which technique is most effective for reducing initial JavaScript bundle size in a large React web app?',
          options: [
            'Replacing CSS with inline styles',
            'Route-based code splitting using React.lazy and dynamic imports',
            'Disabling the React DevTools profiler in development',
            'Converting functional components back into class components'
          ],
          answer: 1,
          explanation: 'Route-based code splitting using dynamic import() and React.lazy ensures users only download the JavaScript chunks required for their current route.'
        }
      }
    ]
  },

  'Data Structures & Algorithms': {
    title: 'Data Structures & Algorithms',
    domain: 'ENGINEERING',
    category: 'Computer Science',
    instructor: 'William Fiset & freeCodeCamp Engineering Team',
    aiSummary: '🤖 AI Summary: Comprehensive algorithms mastery: Asymptotic Big-O analysis, linear arrays, linked lists, trees, graphs, heaps, dynamic programming, and technical interview patterns.',
    modules: [
      {
        id: 'dsa_mod_1',
        title: 'Big-O Complexity & Linear Data Structures (Arrays & Lists)',
        duration: '75 mins',
        completed: false,
        youtubeId: 'Z_c4byLrNBU',
        objectives: [
          'Calculate Time and Space complexities using Big-O, Big-Theta, and Big-Omega notation',
          'Implement singly, doubly, and circular linked lists with pointer manipulation',
          'Understand CPU cache locality benefits in contiguous dynamic arrays'
        ],
        keyPoints: [
          'Dynamic arrays provide O(1) indexed access and O(1) amortized append, but O(n) arbitrary insertion.',
          'Linked lists provide O(1) head insertion/deletion, but suffer from O(n) traversal and cache misses.',
          'Always account for auxiliary memory when analyzing space complexity.'
        ],
        codeSnippet: `// Singly Linked List Node in JavaScript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}`,
        timestamps: [
          { time: '00:00', label: 'Asymptotic Analysis & Big-O Notation' },
          { time: '16:52', label: 'Static vs Dynamic Arrays' },
          { time: '33:45', label: 'Singly Linked List Implementation' },
          { time: '50:37', label: 'Two-Pointer Technique (Cycle Detection)' },
          { time: '67:30', label: 'Complexity Cheat Sheet' }
        ],
        quiz: {
          question: 'What is the time complexity of searching for an element in an unsorted dynamic array of size N?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
          answer: 2,
          explanation: 'In an unsorted array, you must inspect up to N elements sequentially (linear search), giving an O(N) worst-case time complexity.'
        }
      },
      {
        id: 'dsa_mod_2',
        title: 'Hash Tables, Stacks & Queue Architectures',
        duration: '4 mins',
        completed: false,
        youtubeId: 'zfK8hZrUY8Y',
        objectives: [
          'Design hash functions and resolve collisions using Separate Chaining and Open Addressing',
          'Implement LIFO Stack and FIFO Queue patterns',
          'Solve monotonic stack and sliding window maximum challenges'
        ],
        keyPoints: [
          'Good hash functions distribute keys uniformly across buckets with a low load factor (<0.75).',
          'Stacks (LIFO) underpin function call frames, backtracking, and syntax parsing.',
          'Queues (FIFO) power task schedulers, breadth-first search, and asynchronous event loops.'
        ],
        codeSnippet: `// Monotonic Stack for Next Greater Element
function nextGreaterElement(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = []; // indices

  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop();
      res[idx] = nums[i];
    }
    stack.push(i);
  }
  return res;
}`,
        timestamps: [
          { time: '00:00', label: 'Hash Table Collision Resolution' },
          { time: '00:54', label: 'Stack Implementation & Balanced Parentheses' },
          { time: '01:48', label: 'Queue & Circular Buffer' },
          { time: '02:42', label: 'Monotonic Stack Deep Dive' },
          { time: '03:36', label: 'Practice Problems' }
        ],
        quiz: {
          question: 'What is the average time complexity of insertion, deletion, and lookup in a well-distributed Hash Table?',
          options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
          answer: 2,
          explanation: 'With a uniform hash function and low load factor, hash table lookups, insertions, and deletions execute in O(1) average time.'
        }
      },
      {
        id: 'dsa_mod_3',
        title: 'Binary Search Trees, Heaps & Priority Queues',
        duration: '75 mins',
        completed: false,
        youtubeId: 'Z_c4byLrNBU',
        objectives: [
          'Construct Binary Search Trees (BST) and perform Pre/In/Post-order traversals',
          'Understand self-balancing trees (AVL and Red-Black Trees) to prevent O(n) skewing',
          'Implement binary min-heap and max-heap arrays with heapify operations'
        ],
        keyPoints: [
          'In-order traversal of a valid BST produces keys in strictly ascending sorted order.',
          'Binary heaps represent complete binary trees stored compactly in flat arrays (children at 2i+1, 2i+2).',
          'Building a heap from an array takes O(N) time using bottom-up sift-down.'
        ],
        codeSnippet: `// Min-Heap siftDown implementation
function siftDown(heap, i, n) {
  let smallest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && heap[left] < heap[smallest]) smallest = left;
  if (right < n && heap[right] < heap[smallest]) smallest = right;

  if (smallest !== i) {
    [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
    siftDown(heap, smallest, n);
  }
}`,
        timestamps: [
          { time: '00:00', label: 'Tree Terminology & BST Properties' },
          { time: '16:52', label: 'Tree Traversals (DFS vs BFS)' },
          { time: '33:45', label: 'Heap Structure & Array Mapping' },
          { time: '50:37', label: 'Priority Queue Operations (Enqueue/Dequeue)' },
          { time: '67:30', label: 'Top-K Elements Algorithm' }
        ],
        quiz: {
          question: 'Which traversal of a Binary Search Tree visits nodes in sorted order?',
          options: ['Pre-order traversal', 'In-order traversal', 'Post-order traversal', 'Level-order traversal'],
          answer: 1,
          explanation: 'In-order traversal visits (Left Subtree -> Root -> Right Subtree), which naturally yields keys in strictly ascending sorted order for a BST.'
        }
      },
      {
        id: 'dsa_mod_4',
        title: 'Graph Algorithms (BFS/DFS, Dijkstra) & Dynamic Programming',
        duration: '132 mins',
        completed: false,
        youtubeId: 'tWVWeAqZ0WU',
        objectives: [
          'Represent graphs using Adjacency Lists and Adjacency Matrices',
          'Execute Breadth-First Search (shortest path) and Depth-First Search (cycle detection/topological sort)',
          'Formulate Dynamic Programming recurrence relations: Memoization (Top-down) vs Tabulation (Bottom-up)'
        ],
        keyPoints: [
          'Dijkstra algorithm computes single-source shortest paths on non-negative weighted graphs in O((V + E) log V).',
          'Topological Sort requires a Directed Acyclic Graph (DAG) using Kahn algorithm or DFS finish times.',
          'Dynamic programming requires overlapping subproblems and optimal substructure.'
        ],
        codeSnippet: `// Dijkstra Algorithm outline
function dijkstra(graph, startNode, n) {
  const dist = new Array(n).fill(Infinity);
  dist[startNode] = 0;
  const pq = new PriorityQueue(); // [node, distance]
  pq.enqueue([startNode, 0]);

  while (!pq.isEmpty()) {
    const [u, d] = pq.dequeue();
    if (d > dist[u]) continue;

    for (const [v, weight] of graph[u]) {
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
        pq.enqueue([v, dist[v]]);
      }
    }
  }
  return dist;
}`,
        timestamps: [
          { time: '00:00', label: 'Graph Representations (Matrix vs List)' },
          { time: '29:41', label: 'BFS & Shortest Path in Unweighted Graphs' },
          { time: '59:23', label: 'DFS & Topological Sort' },
          { time: '89:05', label: 'Dijkstra Shortest Path with Min-Heap' },
          { time: '118:47', label: 'Dynamic Programming: 0/1 Knapsack Pattern' }
        ],
        quiz: {
          question: 'Which algorithm is best suited to find the shortest path in a weighted graph with non-negative edge weights?',
          options: ['Breadth-First Search', 'Dijkstra Algorithm', 'Depth-First Search', 'Floyd-Warshall for all pairs only'],
          answer: 1,
          explanation: 'Dijkstra algorithm uses a greedy priority-queue approach to compute the single-source shortest paths with optimal O((V + E) log V) efficiency on non-negative edge weights.'
        }
      }
    ]
  },

  'System Design': {
    title: 'System Design',
    domain: 'ENGINEERING',
    category: 'Systems Architecture',
    instructor: 'Gaurav Sen & Distributed Systems Working Group',
    aiSummary: '🤖 AI Summary: Master large-scale distributed system architectures: horizontal scaling, load balancers, caching layers, database sharding, CAP theorem, and event-driven microservices.',
    modules: [
      {
        id: 'sys_mod_1',
        title: 'Distributed Systems Core: Horizontal Scaling & Load Balancing',
        duration: '53 mins',
        completed: false,
        youtubeId: 'F2FmTdLtb_4',
        objectives: [
          'Differentiate horizontal vs vertical scaling and identify single points of failure (SPOF)',
          'Compare Layer 4 (TCP/UDP) vs Layer 7 (HTTP) load balancing algorithms',
          'Implement Consistent Hashing to minimize key remapping across dynamic clusters'
        ],
        keyPoints: [
          'Layer 4 balances traffic based on IP/port; Layer 7 inspects headers, cookies, and HTTP payloads.',
          'Consistent Hashing maps both servers and keys onto a virtual ring, reducing remapping to K/N keys during node addition/removal.',
          'Stateful services require session stickiness or distributed session stores (e.g. Redis).'
        ],
        codeSnippet: `// Consistent Hash Ring Conceptual Layout
class ConsistentHashRing {
  constructor(replicas = 3) {
    this.replicas = replicas;
    this.ring = new Map();
    this.sortedKeys = [];
  }
  // Maps virtual nodes evenly across 32-bit hash space
}`,
        timestamps: [
          { time: '00:00', label: 'Scalability Fundamentals: Scale-Up vs Scale-Out' },
          { time: '11:55', label: 'Load Balancer Algorithms (Round Robin, Least Connections)' },
          { time: '23:51', label: 'L4 vs L7 Reverse Proxies (Nginx, HAProxy)' },
          { time: '35:46', label: 'Consistent Hashing & Virtual Nodes' },
          { time: '47:42', label: 'Health Checks & Failover Systems' }
        ],
        quiz: {
          question: 'What is the primary advantage of Consistent Hashing over standard modulo hashing (hash % N) in a distributed cache?',
          options: [
            'It guarantees zero memory usage',
            'When a server is added or removed, only a small fraction (K/N) of keys need to be relocated',
            'It encrypts cached data automatically',
            'It eliminates the need for hash functions'
          ],
          answer: 1,
          explanation: 'Modulo hashing causes almost all keys to relocate when the server count N changes. Consistent Hashing limits reassignment to only the affected keys adjacent on the ring.'
        }
      },
      {
        id: 'sys_mod_2',
        title: 'Caching Patterns (Redis/Memcached) & CDN Edge Architecture',
        duration: '65 mins',
        completed: false,
        youtubeId: 'VhM2ByShhzE',
        objectives: [
          'Evaluate Cache-Aside, Write-Through, Write-Behind, and Refresh-Ahead strategies',
          'Mitigate caching stampede, cache penetration, and cache breakdown',
          'Leverage Content Delivery Networks (CDNs) for static asset distribution and edge compute'
        ],
        keyPoints: [
          'Cache-Aside (Lazy Loading): Application queries cache first; on miss, loads from DB and populates cache.',
          'Cache Penetration: Requests for non-existent keys bypass cache to hit DB. Mitigate with Bloom Filters.',
          'Eviction policies: LRU (Least Recently Used), LFU (Least Frequently Used), and FIFO.'
        ],
        codeSnippet: `// Cache-Aside Pattern in Node.js
async function getUser(userId) {
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (user) {
    await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));
  }
  return user;
}`,
        timestamps: [
          { time: '00:00', label: 'Why Caching Matters: Latency & Throughput' },
          { time: '14:37', label: 'Cache-Aside vs Write-Through vs Write-Behind' },
          { time: '29:15', label: 'Cache Invalidation, TTLs & Eviction Policies (LRU/LFU)' },
          { time: '43:52', label: 'Cache Stampede & Bloom Filter Defenses' },
          { time: '58:30', label: 'CDN Edge Caching & Anycast Routing' }
        ],
        quiz: {
          question: 'Which caching strategy writes data to the cache and the primary database simultaneously before returning success?',
          options: ['Write-Behind (Write-Back)', 'Cache-Aside', 'Write-Through', 'Read-Through'],
          answer: 2,
          explanation: 'In Write-Through caching, the application writes to the cache, which synchronously updates the database before acknowledging the write.'
        }
      },
      {
        id: 'sys_mod_3',
        title: 'Database Sharding, Replication & CAP Theorem Tradeoffs',
        duration: '5 mins',
        completed: false,
        youtubeId: 'BHqjEjzAicA',
        objectives: [
          'Navigate the CAP Theorem: Consistency, Availability, Partition Tolerance',
          'Implement Primary-Replica replication and manage replication lag',
          'Design horizontal database sharding schemes and cross-shard queries'
        ],
        keyPoints: [
          'In the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).',
          'Sharding keys must avoid hot-spots (e.g. hash-based vs range-based sharding).',
          'Eventual consistency uses vector clocks and quorum consensus (R + W > N).'
        ],
        codeSnippet: `// Quorum Consensus Formula
// N = Number of replicas
// R = Minimum read confirmations
// W = Minimum write confirmations
// If R + W > N -> Strong Consistency (Guaranteed latest write read)`,
        timestamps: [
          { time: '00:00', label: 'CAP Theorem Breakdown & Real-World Examples' },
          { time: '01:07', label: 'Primary-Replica vs Multi-Primary Replication' },
          { time: '02:15', label: 'Horizontal Sharding: Range vs Hash Partitioning' },
          { time: '03:22', label: 'Distributed Transactions & 2-Phase Commit (2PC)' },
          { time: '04:30', label: 'NoSQL vs RDBMS Architecture Selection' }
        ],
        quiz: {
          question: 'According to the CAP Theorem, when a network partition occurs between database nodes, what must the system choose between?',
          options: [
            'Performance vs Scalability',
            'Consistency vs Availability',
            'Latency vs Throughput',
            'ACID vs BASE'
          ],
          answer: 1,
          explanation: 'Under a network partition, you must either return an error/timeout to guarantee consistency, or return potentially stale data to maintain availability.'
        }
      },
      {
        id: 'sys_mod_4',
        title: 'Event-Driven Microservices & Message Queues (Kafka/RabbitMQ)',
        duration: '5 mins',
        completed: false,
        youtubeId: 'PQHf_IzmUXE',
        objectives: [
          'Decouple microservices using asynchronous messaging vs synchronous REST/gRPC',
          'Compare message brokers: RabbitMQ (AMQP message delivery) vs Apache Kafka (distributed commit log)',
          'Implement the Saga pattern for distributed business transactions'
        ],
        keyPoints: [
          'Kafka stores messages in append-only partition logs with consumer group offset tracking.',
          'Idempotent consumers guarantee safe handling of at-least-once message delivery.',
          'The Saga pattern coordinates distributed transactions using local transactions and compensating actions.'
        ],
        codeSnippet: `// Outbox Pattern for Reliable Event Publishing
// 1. Save business entity in database
// 2. Insert event record into outbox table in same ACID transaction
// 3. Debezium / CDC worker reads outbox log and publishes to Kafka`,
        timestamps: [
          { time: '00:00', label: 'Monolith to Microservices Evolution' },
          { time: '01:07', label: 'Message Queues vs Event Streams (RabbitMQ vs Kafka)' },
          { time: '02:15', label: 'Consumer Groups, Offsets & Rebalancing' },
          { time: '03:22', label: 'Saga Pattern & Distributed Orchestration' },
          { time: '04:30', label: 'Monitoring: Distributed Tracing with OpenTelemetry' }
        ],
        quiz: {
          question: 'What ensures that a consumer can safely process duplicate messages delivered by an at-least-once message broker?',
          options: [
            'Increasing network bandwidth',
            'Idempotent message handling (e.g. tracking processed message IDs)',
            'Using FIFO queues only',
            'Disabling consumer acknowledgments'
          ],
          answer: 1,
          explanation: 'An idempotent consumer produces the exact same side-effects regardless of whether a message is processed once or multiple times, safely neutralizing duplicate deliveries.'
        }
      }
    ]
  },

  'Node.js & REST APIs': {
    title: 'Node.js & REST APIs',
    domain: 'ENGINEERING',
    category: 'Backend Development',
    instructor: 'John Smilga & Node.js Foundation Faculty',
    aiSummary: '🤖 AI Summary: Dive into backend development with JavaScript. Master asynchronous event loop architecture, Express.js REST API design, JWT authentication, and high-concurrency database integration.',
    modules: [
      {
        id: 'node_mod_1',
        title: 'Node.js Event Loop, Non-Blocking I/O & Streams',
        duration: '8 mins',
        completed: false,
        youtubeId: 'LflLBw_lUYQ',
        objectives: [
          'Trace the 6 phases of the libuv Event Loop: Timers, Pending, Poll, Check, Close',
          'Handle memory-efficient streaming of large datasets with Readable/Writable streams',
          'Manage process threads with Worker Threads and Cluster module'
        ],
        keyPoints: [
          'Node.js uses a single main JavaScript thread with a background libuv thread pool for file and DNS operations.',
          'process.nextTick executes immediately after the current operation, before the next event loop phase.',
          'Always pipe streams to avoid unbounded memory buffer saturation.'
        ],
        codeSnippet: `// Streaming large files with backpressure
import fs from 'fs';
const readStream = fs.createReadStream('large_dataset.csv');
const writeStream = fs.createWriteStream('output.csv');
readStream.pipe(writeStream);`,
        timestamps: [
          { time: '00:00', label: 'Node.js Architecture & Libuv' },
          { time: '02:23', label: 'Event Loop Phases & Microtask Queue' },
          { time: '04:47', label: 'Streams & Buffer Management' },
          { time: '07:11', label: 'Cluster Mode & PM2 Process Management' }
        ],
        quiz: {
          question: 'Which queue in Node.js has higher priority than the standard event loop timers phase?',
          options: ['check queue (setImmediate)', 'microtask queue (process.nextTick and Promise)', 'poll queue', 'close callbacks queue'],
          answer: 1,
          explanation: 'process.nextTick and Promise microtasks are resolved immediately after the currently executing operation, before the event loop advances to the next phase.'
        }
      },
      {
        id: 'node_mod_2',
        title: 'Express.js Framework, Routing & Middleware Chains',
        duration: '496 mins',
        completed: false,
        youtubeId: 'Oe421EPjeBE',
        objectives: [
          'Design RESTful HTTP endpoints following OpenAPI/Swagger conventions',
          'Compose robust middleware chains for validation, logging, and error handling',
          'Implement rate-limiting and security headers with Helmet and Express-Rate-Limit'
        ],
        keyPoints: [
          'Middleware functions have access to req, res, and the next() function in the request-response cycle.',
          'Centralized error-handling middleware must declare 4 parameters: (err, req, res, next).',
          'Always sanitize user inputs to prevent SQL injection and NoSQL injection vulnerabilities.'
        ],
        codeSnippet: `// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});`,
        timestamps: [
          { time: '00:00', label: 'Express Router Architecture' },
          { time: '148:48', label: 'Custom Middleware Pipeline' },
          { time: '297:36', label: 'Request Validation with Zod/Joi' },
          { time: '446:24', label: 'Security Headers & CORS Config' }
        ],
        quiz: {
          question: 'How does Express differentiate a regular middleware from an error-handling middleware?',
          options: [
            'By using the app.error() method',
            'By specifying exactly 4 arguments in the function signature: (err, req, res, next)',
            'By throwing an uncaught exception',
            'By returning a Promise rejection'
          ],
          answer: 1,
          explanation: 'Express inspects function.length. Functions with 4 parameters are uniquely treated as error-handling middleware.'
        }
      },
      {
        id: 'node_mod_3',
        title: 'Authentication, JWT Tokens & REST Security Hardening',
        duration: '101 mins',
        completed: false,
        youtubeId: 'x5gLL8-M9Fo',
        objectives: [
          'Implement stateless JSON Web Token (JWT) authentication with refresh token rotation',
          'Store tokens securely in HTTP-Only, SameSite, Secure cookies',
          'Protect routes using Role-Based Access Control (RBAC)'
        ],
        keyPoints: [
          'Never store sensitive authentication tokens in browser localStorage (vulnerable to XSS).',
          'Use bcrypt or Argon2 with adequate salt rounds for password hashing.',
          'Short-lived access tokens (15m) paired with long-lived revocable refresh tokens balance security and UX.'
        ],
        codeSnippet: `// JWT Verification Middleware
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}`,
        timestamps: [
          { time: '00:00', label: 'Authentication vs Authorization' },
          { time: '30:18', label: 'JWT Architecture: Header, Payload, Signature' },
          { time: '60:36', label: 'HttpOnly Cookie Storage & CSRF Tokens' },
          { time: '90:54', label: 'RBAC Permission Guards' }
        ],
        quiz: {
          question: 'Where is the most secure location to store an authentication token in a web browser to prevent XSS theft?',
          options: [
            'window.localStorage',
            'window.sessionStorage',
            'An HttpOnly, Secure, SameSite Cookie',
            'A global JavaScript variable'
          ],
          answer: 2,
          explanation: 'HttpOnly cookies cannot be accessed or read by JavaScript running on the page, shielding the token from Cross-Site Scripting (XSS) extraction.'
        }
      },
      {
        id: 'node_mod_4',
        title: 'Database Connection Pools & Scalable API Deployment',
        duration: '125 mins',
        completed: false,
        youtubeId: 'C842vFY5kRo',
        objectives: [
          'Optimize database queries using connection pooling and indexing',
          'Implement pagination (cursor-based vs offset-based) on high-volume endpoints',
          'Deploy Node.js services with graceful shutdown handling'
        ],
        keyPoints: [
          'Connection pools reuse established database sockets, eliminating handshake overhead.',
          'Cursor-based pagination outperforms OFFSET/LIMIT on large datasets by querying indexed keys.',
          'Handle SIGTERM and SIGINT signals to close active connections before process exit.'
        ],
        codeSnippet: `// Graceful Shutdown Handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed. Closing DB connections...');
    pool.end(() => {
      console.log('DB pool closed. Exiting process.');
      process.exit(0);
    });
  });
});`,
        timestamps: [
          { time: '00:00', label: 'Database Connection Pooling' },
          { time: '37:30', label: 'Cursor vs Offset Pagination' },
          { time: '75:00', label: 'Dockerizing the Node.js Service' },
          { time: '112:30', label: 'Graceful Shutdown & Health Checks' }
        ],
        quiz: {
          question: 'Why is cursor-based pagination preferred over OFFSET pagination for large datasets?',
          options: [
            'It consumes less client-side RAM',
            'It leverages an index seek instead of scanning and discarding thousands of offset rows',
            'It does not require SQL indexes',
            'It allows random access to arbitrary page numbers'
          ],
          answer: 1,
          explanation: 'OFFSET N requires the database engine to scan and discard N rows before returning results. Cursor pagination uses an indexed WHERE id > last_seen condition that executes in O(log N).'
        }
      }
    ]
  },

  'Docker & DevOps': {
    title: 'Docker & DevOps',
    domain: 'ENGINEERING',
    category: 'Cloud & DevOps',
    instructor: 'Nana Janashia & DevOps Institute',
    aiSummary: '🤖 AI Summary: Simplify application deployment with containers. Learn Docker architecture, multi-stage Dockerfiles, Docker Compose multi-service topologies, and automated CI/CD deployment pipelines.',
    modules: [
      {
        id: 'dock_mod_1',
        title: 'Containerization Foundations: Namespaces, Cgroups & Dockerfile',
        duration: '449 mins',
        completed: false,
        youtubeId: 'rjjES5IsPdg',
        objectives: [
          'Understand how Linux Namespaces (isolation) and Cgroups (resource limits) create containers',
          'Write multi-stage Dockerfiles to produce minimal, secure production images (<100MB)',
          'Leverage build caching effectively by ordering Dockerfile instructions'
        ],
        keyPoints: [
          'Containers share the host OS kernel; VMs run separate guest OS instances on top of a hypervisor.',
          'Place infrequently changed instructions (like package dependencies) before frequently changed source code to maximize layer cache hits.',
          'Run containers as non-root users for production defense-in-depth.'
        ],
        codeSnippet: `# Multi-stage production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
USER node
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
        timestamps: [
          { time: '00:00', label: 'Containers vs Virtual Machines' },
          { time: '134:42', label: 'Linux Namespaces & Control Groups' },
          { time: '269:24', label: 'Writing Clean Dockerfiles' },
          { time: '404:06', label: 'Multi-Stage Builds & Optimization' }
        ],
        quiz: {
          question: 'What is the primary advantage of a multi-stage Dockerfile?',
          options: [
            'It runs tests in parallel',
            'It keeps build tools and compilers out of the final runtime image, minimizing image size and attack surface',
            'It allows running multiple containers inside one image',
            'It increases network speed between containers'
          ],
          answer: 1,
          explanation: 'Multi-stage builds leave heavyweight compilers, SDKs, and build dependencies in intermediate layers, copying only the final artifacts into a lean runtime image.'
        }
      },
      {
        id: 'dock_mod_2',
        title: 'Docker Compose & Multi-Container Application Orchestration',
        duration: '449 mins',
        completed: false,
        youtubeId: 'rjjES5IsPdg',
        objectives: [
          'Orchestrate multi-tier applications (frontend, backend, database, cache) with Docker Compose',
          'Configure bridge networks for secure service-to-service DNS resolution',
          'Persist database data across container lifecycles using Docker Volumes'
        ],
        keyPoints: [
          'Docker Compose creates an isolated default bridge network where services resolve each other by service name.',
          'Named volumes are stored outside container filesystem boundaries and persist across container recreation.',
          'Use environment variables (.env files) to manage configuration across environments.'
        ],
        codeSnippet: `# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=db
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:`,
        timestamps: [
          { time: '00:00', label: 'Docker Compose Architecture' },
          { time: '134:42', label: 'Service Networking & Internal DNS' },
          { time: '269:24', label: 'Volumes & Persistent Storage' },
          { time: '404:06', label: 'Health Checks & Service Dependencies' }
        ],
        quiz: {
          question: 'In Docker Compose, how does one container communicate over the network with another container in the same compose file?',
          options: [
            'By using the host public IP address',
            'By connecting to the service name defined in docker-compose.yml (e.g. http://db:5432)',
            'Through host port forwarding only',
            'Using shared memory files'
          ],
          answer: 1,
          explanation: 'Docker Compose establishes an internal bridge network with automatic DNS resolution, allowing containers to connect directly using their service names.'
        }
      },
      {
        id: 'dock_mod_3',
        title: 'CI/CD Automation Pipelines with GitHub Actions',
        duration: '32 mins',
        completed: false,
        youtubeId: 'R8_veQiYBjI',
        objectives: [
          'Build end-to-end continuous integration pipelines: linting, unit tests, and security scans',
          'Automate container image build, tagging (SemVer / Git SHA), and push to Container Registries',
          'Manage repository secrets and deployment environments securely'
        ],
        keyPoints: [
          'Fail-fast CI pipelines reject broken code before merging to main trunk.',
          'Use OIDC (OpenID Connect) for cloud provider authentication instead of long-lived static API keys.',
          'Tag images with immutable Git commit SHAs rather than mutable :latest tags.'
        ],
        codeSnippet: `# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
      - run: npm run build`,
        timestamps: [
          { time: '00:00', label: 'CI/CD Principles & Workflows' },
          { time: '09:35', label: 'GitHub Actions Syntax & Triggers' },
          { time: '19:11', label: 'Automated Testing & Security Scanning' },
          { time: '28:47', label: 'Pushing to Docker Hub / GitHub Container Registry' }
        ],
        quiz: {
          question: 'Why should production container deployments avoid using the :latest tag?',
          options: [
            'The :latest tag is deprecated in Docker',
            ':latest is mutable and non-deterministic, making rollbacks and tracking which code is deployed difficult',
            'Docker refuses to pull images with the :latest tag in production',
            ':latest tags always fail security scans'
          ],
          answer: 1,
          explanation: 'The :latest tag changes with every new build. Using immutable tags (e.g. git commit SHA or SemVer) ensures deterministic deployments and seamless rollbacks.'
        }
      },
      {
        id: 'dock_mod_4',
        title: 'Kubernetes Pods, Deployments & Production Rollouts',
        duration: '178 mins',
        completed: false,
        youtubeId: 'd6WC5n9G_sM',
        objectives: [
          'Deconstruct Kubernetes core architecture: Control Plane, Nodes, Pods, Services, Ingress',
          'Execute zero-downtime rolling updates with ReplicaSets and Deployments',
          'Configure Liveness and Readiness probes to guarantee high availability'
        ],
        keyPoints: [
          'Pods are the smallest deployable units in Kubernetes, running one or more tightly coupled containers.',
          'Readiness probes prevent Kubernetes from routing traffic to pods until they are fully initialized.',
          'ConfigMaps and Secrets decouple runtime configurations from container images.'
        ],
        codeSnippet: `# Kubernetes Deployment Manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myregistry/api:v1.2.0
        ports:
        - containerPort: 5000
        readinessProbe:
          httpGet:
            path: /health
            port: 5000`,
        timestamps: [
          { time: '00:00', label: 'Kubernetes Architecture Overview' },
          { time: '53:24', label: 'Deployments, ReplicaSets & Pods' },
          { time: '106:48', label: 'ClusterIP vs NodePort vs LoadBalancer Services' },
          { time: '160:12', label: 'Liveness vs Readiness Probes' }
        ],
        quiz: {
          question: 'What happens when a Kubernetes Readiness probe fails on a running Pod?',
          options: [
            'The Pod is immediately killed and restarted',
            'The Pod is temporarily removed from the Service endpoints so no traffic is sent to it',
            'The node is drained and shut down',
            'The entire deployment is rolled back'
          ],
          answer: 1,
          explanation: 'A failed readiness probe isolates the pod from receiving incoming traffic until it reports ready again. (A failed liveness probe, in contrast, triggers a pod restart).'
        }
      }
    ]
  },

  'TypeScript': {
    title: 'TypeScript',
    domain: 'ENGINEERING',
    category: 'Software Engineering',
    instructor: 'Anders Hejlsberg & Microsoft TypeScript Team',
    aiSummary: '🤖 AI Summary: Add superpowers to JavaScript with static typing. Master primitive types, interfaces, generics, conditional types, mapped types, and enterprise React/Node type safety.',
    modules: [
      {
        id: 'ts_mod_1',
        title: 'Type System Core: Primitive Types, Interfaces & Type Aliases',
        duration: '286 mins',
        completed: false,
        youtubeId: '30LWjhZzg50',
        objectives: [
          'Understand structural typing (duck typing) vs nominal typing in TypeScript',
          'Compare interface vs type alias capabilities and declaration merging',
          'Enforce strict null checks with union types and optional chaining'
        ],
        keyPoints: [
          'TypeScript types exist solely at compile time; all type annotations are stripped during compilation.',
          'Interfaces can be reopened and extended (declaration merging); type aliases cannot.',
          'Use unknown instead of any to mandate explicit type narrowing before usage.'
        ],
        codeSnippet: `// Interface vs Type Alias
interface User {
  id: string;
  name: string;
  email?: string; // optional
}

type UserWithRole = User & {
  role: 'admin' | 'member';
};`,
        timestamps: [
          { time: '00:00', label: 'Why TypeScript? Static Analysis & Tooling' },
          { time: '85:48', label: 'Type Annotations & Inferences' },
          { time: '171:36', label: 'Interfaces vs Type Aliases' },
          { time: '257:24', label: 'Union Types, Enums & Literal Types' }
        ],
        quiz: {
          question: 'What is the primary difference between any and unknown in TypeScript?',
          options: [
            'There is no difference; they are interchangeable',
            'unknown requires type checking or narrowing before you can perform operations on it, whereas any disables all type checking',
            'any can only hold numbers; unknown can hold objects',
            'unknown is a runtime JavaScript type'
          ],
          answer: 1,
          explanation: 'unknown is the type-safe counterpart of any. TypeScript forces developers to narrow or assert the type of an unknown variable before accessing its properties.'
        }
      },
      {
        id: 'ts_mod_2',
        title: 'Advanced Generics, Utility Types & Type Narrowing',
        duration: '286 mins',
        completed: false,
        youtubeId: '30LWjhZzg50',
        objectives: [
          'Write flexible, reusable components and functions using Generics (<T>)',
          'Master built-in utility types: Partial, Pick, Omit, Record, Readonly',
          'Narrow types safely using typeof, instanceof, and custom User-Defined Type Guards'
        ],
        keyPoints: [
          'Generic constraints (<T extends object>) restrict the types that can be passed to a generic parameter.',
          'Discriminated Unions use a common literal property (tag) to enable exhaustive compile-time checking.',
          'Custom type predicates (val is Type) teach the TypeScript compiler how to narrow custom objects.'
        ],
        codeSnippet: `// Generic API Response Wrapper & Type Guard
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

function isErrorResponse<T>(res: ApiResponse<T>): res is ApiResponse<T> & { error: string } {
  return typeof res.error === 'string';
}`,
        timestamps: [
          { time: '00:00', label: 'Generic Functions & Classes' },
          { time: '85:48', label: 'Generic Constraints with extends' },
          { time: '171:36', label: 'Built-in Utility Types (Pick, Omit, Record)' },
          { time: '257:24', label: 'Discriminated Unions & Type Guards' }
        ],
        quiz: {
          question: 'Which utility type constructs a type with all properties of T set to optional?',
          options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Record<T, any>'],
          answer: 1,
          explanation: 'Partial<T> returns a type with all properties of T marked optional (?), making it ideal for PATCH requests or partial updates.'
        }
      },
      {
        id: 'ts_mod_3',
        title: 'TypeScript with React: Typed Props, State & Generics',
        duration: '51 mins',
        completed: false,
        youtubeId: 'aJP1AbZSqz8',
        objectives: [
          'Type React components, children (React.ReactNode), and HTML element props',
          'Type event handlers (React.MouseEvent, React.ChangeEvent<HTMLInputElement>) accurately',
          'Build polymorphic React components with generic props'
        ],
        keyPoints: [
          'Prefer typing component props explicitly using interface Props rather than React.FC.',
          'React.ComponentPropsWithoutRef<"button"> inherits all standard HTML button attributes.',
          'Type useState with unions when the initial state is null: useState<User | null>(null).'
        ],
        codeSnippet: `// Strongly Typed React Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', isLoading, children, ...props }) => {
  return (
    <button className={\`btn btn-\${variant}\`} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};`,
        timestamps: [
          { time: '00:00', label: 'Setting up TypeScript in React with Vite' },
          { time: '15:17', label: 'Typing Props, Children & Default Values' },
          { time: '30:35', label: 'Typing Hooks (useState, useReducer, useRef)' },
          { time: '45:53', label: 'Typing Form & Click Events' }
        ],
        quiz: {
          question: 'What is the correct type for an input onChange event handler in React with TypeScript?',
          options: [
            'Event',
            'React.ChangeEvent<HTMLInputElement>',
            'React.FormEvent<any>',
            'React.InputEvent'
          ],
          answer: 1,
          explanation: 'React.ChangeEvent<HTMLInputElement> provides accurate typing for e.target.value when listening to HTML input changes in React.'
        }
      },
      {
        id: 'ts_mod_4',
        title: 'Enterprise Architecture: Strict Null Checks & tsconfig',
        duration: '53 mins',
        completed: false,
        youtubeId: 'F2FmTdLtb_4',
        objectives: [
          'Configure enterprise-grade tsconfig.json compiler flags (strict: true, noImplicitAny, exactOptionalPropertyTypes)',
          'Implement Mapped Types and Conditional Types (infer keyword)',
          'Integrate ESLint and TypeScript for automated code review checks'
        ],
        keyPoints: [
          'Enabling strict: true activates a suite of type-checking behaviors including strictNullChecks and strictFunctionTypes.',
          'Conditional types (T extends U ? X : Y) allow dynamic type generation based on relationships.',
          'The infer keyword introduces a type variable to be deduced within conditional type clauses.'
        ],
        codeSnippet: `// Conditional Type with infer to extract return type
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function calculateScore(): number {
  return 98;
}

type Score = MyReturnType<typeof calculateScore>; // number`,
        timestamps: [
          { time: '00:00', label: 'tsconfig.json Critical Flags' },
          { time: '15:54', label: 'Conditional Types & infer Keyword' },
          { time: '31:48', label: 'Mapped Types & Template Literal Types' },
          { time: '47:42', label: 'Strict Null Handling in Enterprise Apps' }
        ],
        quiz: {
          question: 'What does the strictNullChecks compiler option do in TypeScript?',
          options: [
            'It removes all null values at runtime',
            'It ensures null and undefined cannot be assigned to other types without an explicit union (e.g. string | null)',
            'It disables the use of undefined completely',
            'It forces all functions to return a value'
          ],
          answer: 1,
          explanation: 'With strictNullChecks enabled, null and undefined are distinct types that cannot be assigned to numbers or strings unless explicitly declared in a union type.'
        }
      }
    ]
  },

  
  'Frontend Architecture': {
    title: 'Frontend Architecture',
    domain: 'ENGINEERING',
    category: 'Software Engineering',
    instructor: 'Engineering Team',
    aiSummary: '🤖 AI Summary: Master scalable frontend architecture, micro-frontends, module federation, and monorepo management for enterprise applications.',
    modules: [{
      id: 'fa_mod_1',
      title: 'Microfrontends & Monorepos',
      duration: '40 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Understand the architecture of Micro-Frontends',
        'Implement Webpack Module Federation for independent deployments',
        'Manage monorepos efficiently using Turborepo or Nx'
      ],
      keyPoints: [
        'Micro-frontends allow independent teams to scale and deploy features without blocking each other.',
        'Webpack Module Federation enables sharing code dynamically at runtime.',
        'Monorepos simplify dependency management across multiple packages and apps.'
      ],
      timestamps: [
        { time: '00:00', label: 'Introduction to Micro-Frontends' },
        { time: '85:48', label: 'Monorepo Concepts (Turborepo/Nx)' },
        { time: '171:36', label: 'Webpack Module Federation Demo' },
        { time: '257:24', label: 'Deployment & CI/CD Pipelines' }
      ],
      quiz: {
        question: 'What is the primary benefit of Webpack Module Federation in a micro-frontend architecture?',
        options: ['It minifies all CSS files automatically', 'It allows multiple independent builds to form a single application at runtime', 'It replaces the Virtual DOM', 'It enforces strict typing across all components'],
        answer: 1,
        explanation: 'Module Federation allows JavaScript applications to dynamically load code from another application at runtime, which is the cornerstone of scalable micro-frontends.'
      }
    }]
  },
  'Backend Scaling with Node.js': {
    title: 'Backend Scaling with Node.js',
    domain: 'ENGINEERING',
    category: 'Backend',
    instructor: 'Engineering Team',
    aiSummary: '🤖 AI Summary: Master backend performance tuning, Node.js clustering, worker threads, and zero-downtime deployments using PM2.',
    modules: [{
      id: 'bs_mod_1',
      title: 'Clustering & PM2',
      duration: '45 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Understand the single-threaded nature of Node.js and its limitations',
        'Implement the Cluster module to fork multiple worker processes',
        'Use PM2 for process management and zero-downtime reloads'
      ],
      keyPoints: [
        'Node.js runs on a single thread; clustering allows it to utilize multi-core systems by spawning worker processes.',
        'PM2 acts as a daemon process manager that handles automatic restarts and load balancing.',
        'Zero-downtime deployment is achieved by reloading workers one by one.'
      ],
      timestamps: [
        { time: '00:00', label: 'Node.js Threading Model' },
        { time: '13:30', label: 'The built-in Cluster Module' },
        { time: '27:00', label: 'Introduction to PM2' },
        { time: '40:30', label: 'Zero-Downtime Reloads in Production' }
      ],
      quiz: {
        question: 'How does the Node.js Cluster module improve performance on a multi-core CPU?',
        options: ['By executing JavaScript natively on the GPU', 'By forking the main process into multiple worker processes that share the same server port', 'By rewriting synchronous code to asynchronous', 'By increasing the V8 memory limit'],
        answer: 1,
        explanation: 'The Cluster module allows you to create child processes (workers) that run simultaneously and share the same server port, effectively multiplying the throughput across CPU cores.'
      }
    }]
  },
  'System Design Patterns': {
    title: 'System Design Patterns',
    domain: 'ENGINEERING',
    category: 'Architecture',
    instructor: 'Architecture Team',
    aiSummary: '🤖 AI Summary: Master enterprise patterns like CQRS, Event Sourcing, Circuit Breakers, and Saga for building resilient distributed systems.',
    modules: [{
      id: 'sdp_mod_1',
      title: 'CQRS & Event Sourcing',
      duration: '50 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Separate read and write models using Command Query Responsibility Segregation (CQRS)',
        'Implement Event Sourcing to store application state as a sequence of events',
        'Understand eventual consistency and materialized views'
      ],
      keyPoints: [
        'CQRS allows independent scaling of read databases (optimized for queries) and write databases (optimized for transactions).',
        'Event Sourcing ensures complete auditability because the current state is derived by replaying a ledger of events.',
        'These patterns introduce eventual consistency, meaning reads might slightly lag behind writes.'
      ],
      timestamps: [
        { time: '00:00', label: 'What is CQRS?' },
        { time: '15:00', label: 'Designing the Write & Read Models' },
        { time: '30:00', label: 'Introduction to Event Sourcing' },
        { time: '45:00', label: 'Handling Eventual Consistency' }
      ],
      quiz: {
        question: 'In an Event Sourcing system, how is the current state of an entity determined?',
        options: ['By querying a traditional relational SQL table', 'By replaying the sequence of domain events that occurred for that entity', 'By asking a caching layer like Redis', 'By using a two-phase commit protocol'],
        answer: 1,
        explanation: 'Event Sourcing stores every change to state as an event. The current state is calculated by sequentially applying these historical events.'
      }
    }]
  },
  'GraphQL APIs': {
    title: 'GraphQL APIs',
    domain: 'ENGINEERING',
    category: 'Backend',
    instructor: 'API Team',
    aiSummary: '🤖 AI Summary: Master GraphQL schemas, resolvers, mutations, and solve the N+1 query problem using DataLoader.',
    modules: [{
      id: 'gql_mod_1',
      title: 'Schema Design & Resolvers',
      duration: '35 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Design a strongly-typed GraphQL schema using SDL',
        'Write efficient resolvers for nested data fetching',
        'Solve the N+1 query performance bottleneck using DataLoader'
      ],
      keyPoints: [
        'GraphQL eliminates over-fetching and under-fetching by allowing clients to request exactly what they need.',
        'Every field in a GraphQL query is backed by a resolver function on the server.',
        'DataLoader batches and caches database queries within a single request to prevent the N+1 problem.'
      ],
      timestamps: [
        { time: '00:00', label: 'GraphQL vs REST' },
        { time: '10:30', label: 'Defining the Schema (SDL)' },
        { time: '21:00', label: 'Writing Resolvers & Mutations' },
        { time: '31:30', label: 'Optimizing with DataLoader' }
      ],
      quiz: {
        question: 'What performance issue does DataLoader primarily solve in GraphQL servers?',
        options: ['Memory leaks in long-running processes', 'The N+1 query problem by batching and caching database requests', 'Slow HTTP handshake times', 'Inefficient JSON parsing'],
        answer: 1,
        explanation: 'Because GraphQL resolvers execute independently for nested fields, fetching a list of items and their relations can cause hundreds of separate database queries (N+1). DataLoader batches these into a single query.'
      }
    }]
  },
  'Basic Physiology Revision': {
    title: 'Basic Physiology Revision',
    domain: 'MEDICAL',
    category: 'Preclinical',
    instructor: 'Medical Faculty',
    aiSummary: '🤖 AI Summary: Review core physiology concepts, cellular transport, membrane potentials, and homeostasis mechanisms.',
    modules: [{
      id: 'physio_mod_1',
      title: 'Cellular Physiology',
      duration: '30 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Understand active and passive cellular transport mechanisms',
        'Calculate resting membrane potential using the Nernst equation',
        'Explain the role of the Na+/K+ ATPase pump in maintaining gradients'
      ],
      keyPoints: [
        'The Na+/K+ ATPase pump uses ATP to move 3 Na+ out and 2 K+ in, maintaining the electrochemical gradient.',
        'Resting membrane potential is primarily driven by K+ leak channels.',
        'Action potentials are triggered when voltage-gated Na+ channels open upon reaching the threshold potential.'
      ],
      timestamps: [
        { time: '00:00', label: 'Cellular Transport Basics' },
        { time: '09:00', label: 'The Na+/K+ ATPase Pump' },
        { time: '18:00', label: 'Resting Membrane Potential' },
        { time: '27:00', label: 'Action Potentials & Depolarization' }
      ],
      quiz: {
        question: 'Which ion is primarily responsible for establishing the resting membrane potential of a typical neuron?',
        options: ['Sodium (Na+)', 'Calcium (Ca2+)', 'Potassium (K+)', 'Chloride (Cl-)'],
        answer: 2,
        explanation: 'The resting membrane is highly permeable to Potassium (K+) due to leak channels. The efflux of K+ down its concentration gradient establishes the negative resting potential.'
      }
    }]
  },
  'Advanced Diagnostics': {
    title: 'Advanced Diagnostics',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Diagnostic Team',
    aiSummary: '🤖 AI Summary: Master complex diagnostic algorithms, structured differential formulation, and evidence-based test selection.',
    modules: [{
      id: 'diag_mod_1',
      title: 'Differential Diagnosis',
      duration: '45 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Formulate a broad and structured differential diagnosis',
        'Apply the VINDICATE mnemonic to categorize etiologies',
        'Utilize pre-test probability and likelihood ratios to interpret test results'
      ],
      keyPoints: [
        'VINDICATE stands for Vascular, Infectious, Neoplastic, Degenerative, Iatrogenic/Intoxication, Congenital, Autoimmune, Traumatic, Endocrine.',
        'Pre-test probability dramatically affects the positive predictive value of any diagnostic test.',
        "Always rule out life-threatening ('can\\'t miss') diagnoses first."
      ],
      timestamps: [
        { time: '00:00', label: 'Clinical Reasoning & Heuristics' },
        { time: '13:30', label: 'The VINDICATE Mnemonic' },
        { time: '27:00', label: 'Bayes Theorem in Diagnostics' },
        { time: '40:30', label: 'Case Study: Undifferentiated Chest Pain' }
      ],
      quiz: {
        question: 'What does the "V" in the VINDICATE mnemonic stand for?',
        options: ['Viral', 'Vascular', 'Visceral', 'Vestibular'],
        answer: 1,
        explanation: 'Vascular. The VINDICATE mnemonic helps systematically brainstorm etiologies: Vascular, Infectious, Neoplastic, Degenerative, Iatrogenic/Intoxication, Congenital, Autoimmune, Traumatic, Endocrine.'
      }
    }]
  },
  'Clinical Pharmacology': {
    title: 'Clinical Pharmacology',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Pharmacy Team',
    aiSummary: '🤖 AI Summary: Deep dive into clinical drug applications, polypharmacy, cytochrome P450 interactions, and therapeutic monitoring.',
    modules: [{
      id: 'cpharm_mod_1',
      title: 'Drug-Drug Interactions',
      duration: '40 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Identify major Cytochrome P450 (CYP) inducers and inhibitors',
        'Predict clinical consequences of co-administering interacting drugs',
        'Manage polypharmacy in elderly populations'
      ],
      keyPoints: [
        'CYP inducers (e.g., Rifampin, Phenytoin) accelerate metabolism, potentially reducing drug efficacy.',
        'CYP inhibitors (e.g., Amiodarone, Grapefruit juice) slow metabolism, increasing toxicity risks.',
        'Drugs with narrow therapeutic indices (e.g., Warfarin, Lithium) require stringent monitoring when altering regimens.'
      ],
      timestamps: [
        { time: '00:00', label: 'Pharmacokinetics Review' },
        { time: '12:00', label: 'Cytochrome P450 System' },
        { time: '24:00', label: 'Major Inducers vs Inhibitors' },
        { time: '36:00', label: 'Clinical Case: Warfarin Interactions' }
      ],
      quiz: {
        question: 'If a patient on stable Warfarin therapy begins taking a strong CYP450 inhibitor, what is the expected clinical effect?',
        options: ['Decreased INR and risk of thrombosis', 'Increased INR and risk of bleeding', 'No change in coagulation profile', 'Immediate anaphylaxis'],
        answer: 1,
        explanation: 'A CYP inhibitor slows the metabolism of Warfarin, causing drug accumulation. This leads to a supra-therapeutic INR and a dangerously increased risk of hemorrhage.'
      }
    }]
  },
  'ECG Interpretation': {
    title: 'ECG Interpretation',
    domain: 'MEDICAL',
    category: 'Clinical',
    instructor: 'Cardiology Team',
    aiSummary: '🤖 AI Summary: Master the 12-lead ECG, identify life-threatening arrhythmias, conduction blocks, and signs of ischemia.',
    modules: [{
      id: 'ecg_mod_1',
      title: 'Rate, Rhythm & Axis',
      duration: '30 mins',
      completed: false,
      youtubeId: 'M7lc1UVf-VE',
      objectives: [
        'Accurately calculate heart rate using the 300-150-100 method',
        'Determine the cardiac axis using Leads I and aVF',
        'Identify sinus rhythm and basic arrhythmias'
      ],
      keyPoints: [
        'A normal QRS axis lies between -30 and +90 degrees (positive in Lead I and aVF).',
        'Normal sinus rhythm requires a P wave before every QRS complex, and a QRS after every P wave.',
        'The PR interval should be between 120-200ms (3 to 5 small squares).'
      ],
      timestamps: [
        { time: '00:00', label: 'ECG Paper & Calibration' },
        { time: '09:00', label: 'Calculating Heart Rate' },
        { time: '18:00', label: 'Determining Cardiac Axis' },
        { time: '27:00', label: 'Sinus Rhythm vs Atrial Fibrillation' }
      ],
      quiz: {
        question: 'If the QRS complex is strongly positive in Lead I but strongly negative in Lead aVF, what is the electrical axis?',
        options: ['Normal Axis', 'Right Axis Deviation (RAD)', 'Left Axis Deviation (LAD)', 'Extreme Axis Deviation'],
        answer: 2,
        explanation: 'Positive in Lead I and negative in aVF indicates Left Axis Deviation (LAD), generally considered to be between -30 and -90 degrees.'
      }
    }]
  }

};
