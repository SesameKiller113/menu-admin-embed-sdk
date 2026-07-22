import { mountMenuAdmin } from "@menu-admin-embed-sdk/sdk";
import "./styles.css";

const header = document.querySelector<HTMLElement>(".site-header");
const sdkRoot = document.querySelector<HTMLElement>("#menu-admin-sdk-root");
const menuAdminHandle = sdkRoot
  ? mountMenuAdmin({
      container: sdkRoot,
      restaurantId: getRequiredDataValue(sdkRoot, "restaurantId"),
      apiBaseUrl: getRequiredDataValue(sdkRoot, "apiBaseUrl"),
      auth: {
        getAccessToken: async () =>
          import.meta.env.VITE_MENU_ADMIN_ACCESS_TOKEN?.trim() || null
      },
      requestTimeoutMs: 8000,
      theme: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        primaryColor: "#245a42",
        textColor: "#1f2c27"
      },
      onError(error) {
        console.error("Menu admin SDK error", error);
      }
    })
  : null;

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    menuAdminHandle?.unmount();
  });
}

function getRequiredDataValue(element: HTMLElement, key: string) {
  const value = element.dataset[key]?.trim();

  if (!value) {
    throw new Error(`Restaurant site is missing data-${key}.`);
  }

  return value;
}
