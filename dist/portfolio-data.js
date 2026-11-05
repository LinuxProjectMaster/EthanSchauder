/** Public portfolio copy, drawn from Ethan's resume and the linked Devpost page. */
export const INTRO = {
  name: ["ETHAN", "SCHAUDER"],
  education: "COMPUTER SCIENCE · UNIVERSITY OF VIRGINIA",
  interests: "MACHINE LEARNING · FULL-STACK DEVELOPMENT · AEROSPACE",
};

export const PROTON_PROJECTOR = {
  projectId: "proton-projector",
  x: -5.6,
  z: 20,
  title: "PROTON PROJECTOR",
  label: "PROJECT 01 · STELLAR GATEWAY QUEST",
  text: "Proton Projector was a machine-learning application that predicted solar proton flux using live NOAA data. A Darts Temporal Fusion Transformer generated proton-flux forecasts using future electron and low-energy proton values predicted by an RNN. The Flask backend and React-Bootstrap interface allowed users to configure hyperparameters, train the model, and visualize its forecasts. The project earned third place at Stellar Gateway Quest.",
  technologies: "Darts · TFT · RNN · Flask · React-Bootstrap · NumPy · pandas",
  url: "https://devpost.com/software/proton-projector",
};

export const NEURIPS_ARIEL = {
  projectId: "neurips-ariel",
  x: 11.2,
  z: 34,
  title: "NEURIPS ARIEL CHALLENGE",
  label: "PROJECT 02 · SILVER MEDAL · 2025",
  text: "Earned a silver medal in the NeurIPS Ariel Data Challenge 2025. Developed Bayesian and machine-learning models that predicted exoplanet transmission spectra using Gaussian Process Regression, detrending, and feature engineering, and outperformed 96% of more than 850 competing teams. Extended the model into an applied exoplanet study and presented the research at the Regional Science and Engineering Fair under the mentorship of Dr. Yifan Zhou at UVA Astronomy.",
  technologies:
    "Bayesian modeling · Machine learning · Gaussian Process Regression · Detrending · Feature engineering",
  url: "https://www.kaggle.com/code/ethanjschauder/submission-pipeline-final",
  linkLabel: "View submission notebook on Kaggle ↗",
};

export const CHRONOPEDIA = {
  projectId: "chronopedia",
  x: 2.7,
  z: 48,
  title: "CHRONOPEDIA",
  label: "PROJECT 03 · ACADEMIESHACKS 2025",
  text: "Chronopedia was a time-travelling encyclopedia that reimagined Wikipedia articles for a user-selected year and language. A Flask backend retrieved article content and used DeepSeek with Hugging Face to generate the alternate-time text, which was presented in a Svelte interface. Text-to-speech made the experience more accessible. Ethan built the Flask backend and the gTTS text-to-speech accessibility features.",
  technologies: "Flask · Python · DeepSeek · Hugging Face · Svelte · gTTS",
  url: "https://devpost.com/software/chronopedia",
};

export const PROJECTS = [PROTON_PROJECTOR, NEURIPS_ARIEL, CHRONOPEDIA];

export const TRAIL_SIGNS = PROJECTS;
