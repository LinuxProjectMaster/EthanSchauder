/** Shared coordinates and profile copy for the two connected portfolio spaces. */
export const HOME = "home";
export const PROJECT_WORLD = "projects";
export const HOME_SPAWN = { x: 0, y: 0, z: 4 };
export const PROJECT_SPAWN = { x: 0, y: 0, z: 12 };
export const HOME_POND = { x: 0, z: -8, radiusX: 4.6, radiusZ: 3.2 };
export const PROJECT_POND = { x: 0, z: 5, radiusX: 4.6, radiusZ: 3.2 };

export const HOME_SIGNS = [
  {
    x: -5.5, z: 5, title: "ABOUT", label: "MEET ETHAN",
    image: { src: "./assets/ethan.jpg", alt: "Ethan Schauder", width: 975, height: 1600 },
    text: "Hi!\n\nI’m Ethan, and I’m a software developer from Leesburg, Virginia. I’m currently attending the University of Virginia for my Bachelor’s of Science in Computer Science, and hope to graduate by May 2029. Most of my work is astronomy-related, but there are some random side projects in the mix. You can check out my projects by diving into the pond!",
  },
  {
    x: 5.5, z: 5, title: "EDUCATION", label: "UNIVERSITY OF VIRGINIA",
    text: "I study computer science at the University of Virginia. My interests reach from building useful web applications to exploring machine learning and aerospace. My exoplanet research was mentored by Dr. Yifan Zhou at UVA Astronomy.",
  },
  {
    x: -6.5, z: -1, title: "INTERESTS", label: "WHAT I LIKE TO BUILD",
    text: "Machine learning, full-stack development, and aerospace. My projects include forecasting solar proton flux, predicting exoplanet spectra, and building an accessible, time-travelling encyclopedia.",
    technologies: "Python · Flask · React · Svelte · Bayesian modeling",
  },
  {
    x: 6.5, z: -1, title: "CONTACTS", label: "LET’S CONNECT",
    text: "Have a project in mind, a question, or just want to say hello? Let’s connect.",
    links: [
      { label: "schauderethan@gmail.com", url: "mailto:schauderethan@gmail.com" },
      { label: "LinkedIn ↗", url: "https://www.linkedin.com/in/ethan-schauder-29b497309/" },
    ],
  },
].map((sign) => ({ ...sign, realm: HOME, runic: true }));

export function isInPond(position, pond) {
  return position.y < 0.1 && Math.hypot(
    (position.x - pond.x) / pond.radiusX,
    (position.z - pond.z) / pond.radiusZ,
  ) <= 1;
}

/** Keep the projects trail ahead of the otter in the default screen view. */
export function getRealmCameraOrbit(orbit, realm) {
  return orbit + (realm === PROJECT_WORLD ? Math.PI : 0);
}
