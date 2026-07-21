import "./styles.css";

const header = document.querySelector<HTMLElement>(".site-header");

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
});
