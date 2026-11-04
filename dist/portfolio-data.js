/** Public portfolio copy, drawn from Ethan's resume and the linked Devpost page. */
export const INTRO = {
  name: ["ETHAN", "SCHAUDER"],
  education: "COMPUTER SCIENCE · UNIVERSITY OF VIRGINIA",
  interests: "MACHINE LEARNING · FULL-STACK DEVELOPMENT · AEROSPACE",
};

export const PROTON_PROJECTOR = {
  projectId: "proton-projector",
  x: -5.6,
  z: 32,
  title: "PROTON PROJECTOR",
  label: "PROJECT 01 · STELLAR GATEWAY QUEST",
  text: "A machine-learning application for predicting solar proton flux using live NOAA data. A Darts Temporal Fusion Transformer forecasts proton flux, using future electron and low-energy proton values predicted by an RNN. The Flask backend and React-Bootstrap interface let users configure hyperparameters, train the model, and visualize its forecasts. Awarded third place at Stellar Gateway Quest.",
  technologies: "Darts · TFT · RNN · Flask · React-Bootstrap · NumPy · pandas",
  url: "https://devpost.com/software/proton-projector",
};

export const NEURIPS_ARIEL = {
  projectId: "neurips-ariel",
  x: 11.2,
  z: 58,
  title: "NEURIPS ARIEL CHALLENGE",
  label: "PROJECT 02 · SILVER MEDAL · 2025",
  text: "Silver medalist in the NeurIPS Ariel Data Challenge 2025. Developed Bayesian and machine-learning models to predict exoplanet transmission spectra using Gaussian Process Regression, detrending, and feature engineering, outperforming 96% of more than 850 competing teams. Extended the model into an applied exoplanet study and presented the research at the Regional Science and Engineering Fair under the mentorship of Dr. Yifan Zhou at UVA Astronomy.",
  technologies:
    "Bayesian modeling · Machine learning · Gaussian Process Regression · Detrending · Feature engineering",
  url: "https://www.kaggle.com/code/ethanjschauder/submission-pipeline-final",
  linkLabel: "View submission notebook on Kaggle ↗",
};

export const CHRONOPEDIA = {
  projectId: "chronopedia",
  x: 2.7,
  z: 84,
  title: "CHRONOPEDIA",
  label: "PROJECT 03 · ACADEMIESHACKS 2025",
  text: "A time-travelling encyclopedia that reimagines Wikipedia articles for a user-selected year and language. A Flask backend retrieves article content and uses DeepSeek with Hugging Face to generate the alternate-time text, which is presented in a Svelte interface. Text-to-speech makes the experience more accessible. Ethan built the Flask backend and the gTTS text-to-speech accessibility features.",
  technologies: "Flask · Python · DeepSeek · Hugging Face · Svelte · gTTS",
  url: "https://devpost.com/software/chronopedia",
};

export const PROJECTS = [PROTON_PROJECTOR, NEURIPS_ARIEL, CHRONOPEDIA];

export const TRAIL_SIGNS = [
  PROTON_PROJECTOR,
  NEURIPS_ARIEL,
  CHRONOPEDIA,
  {
    x: 9.6,
    z: 110,
    title: "UNDER THE CANOPY",
    text: "A patch of shade, a little grass, and room to wander. The path will still be here when you come back.",
  },
  {
    x: 3.6,
    z: 136,
    title: "THE SCENIC ROUTE",
    text: "Sometimes the best part of a journey is a small detour. Turn toward the trees, take a few soft steps, then find your way back.",
  },
  {
    x: 20,
    z: 162,
    title: "A LITTLE FURTHER",
    text: "You have come a long way on small paws. Take a breath, turn around, and enjoy the view from the other direction.",
  },
];
