/** Shared coordinates and profile copy for the two connected portfolio spaces. */
export const HOME = "home";
export const PROJECT_WORLD = "projects";
export const HOME_SPAWN = { x: 0, y: 0, z: 4 };
export const PROJECT_SPAWN = { x: 0, y: 0, z: 12 };
export const HOME_POND = { x: 0, z: -8, radiusX: 4.6, radiusZ: 3.2 };
export const PROJECT_POND = { x: 0, z: 5, radiusX: 4.6, radiusZ: 3.2 };

export const HOME_SIGNS = [
  {
    x: -6, z: 5, title: "ABOUT", label: "",
    image: { src: "./assets/ethan.jpg", alt: "Ethan Schauder", width: 975, height: 1600 },
    text: "Hi!\n\nI’m Ethan, and I’m a software developer from Leesburg, Virginia.\n\nI’m currently attending the University of Virginia for my Bachelor’s of Science in Computer Science, and hope to graduate by May 2029.\n\nMost of my work is astronomy-related, but there are some random side projects in the mix. You can check out my projects by diving into the pond!",
  },
  {
    x: 0, z: 0, title: "CREDITS", pageTitle: "Credits", routeAliases: ["interests", "behind-the-scenes"], label: "HOW THIS SITE WAS BUILT",
    text: "This portfolio is a little world you can explore. It uses WebGL and Three.js for the 3D scenery, lighting, camera, and animation, with HTML, CSS, and JavaScript for the interface.\n\nEach scene is assembled from reusable components: terrain, ponds, signs, glowing runes, and project exhibits. Walk onto a rune to read a page, or dive into the pond to explore my projects.\n\nThe animated otter comes from Cozy Animals 3D Models by Gamideo (dragofive), released under CC0.\n\nBuilt with help from ChatGPT for coding, design iteration, and debugging.\n\nHeavily inspired by the portfolio site of Bruno Simon—check his site out, it’s insane!",
    technologies: "WebGL · Three.js · JavaScript · HTML · CSS",
    links: [
      { label: "Bruno Simon’s portfolio ↗", url: "https://bruno-simon.com/" },
      { label: "Otter model by Gamideo (CC0) ↗", url: "https://dragofive.itch.io/cozy-animals-3d" },
      { label: "ChatGPT ↗", url: "https://chatgpt.com/" },
    ],
  },
  {
    x: 6, z: 5, title: "CONTACTS", label: "LET’S CONNECT",
    text: "Feel free to reach out! I don't bite I promise.",
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
