import { ThemeProvider } from "#components/ThemeProvider";
import { createRouter } from "@atomiton/router";

// Import template components directly
import ButtonsPage from "#templates/ButtonsPage";
import CardsPage from "#templates/CardsPage";
import ColorsPage from "#templates/ColorsPage";
import CommentPage from "#templates/CommentPage";
import DepthsPage from "#templates/DepthsPage";
import DropdownPage from "#templates/DropdownPage";
import HomePage from "#templates/HomePage";
import IconographyPage from "#templates/IconographyPage";
import InputsPage from "#templates/InputsPage";
import MenuPage from "#templates/MenuPage";
import ModalPage from "#templates/ModalPage";
import NotificationsPage from "#templates/NotificationsPage";
import PromptInputPage from "#templates/PromptInputPage";
import SidebarPage from "#templates/SidebarPage";
import ToolbarPage from "#templates/ToolbarPage";
import TopbarPage from "#templates/TopbarPage";
import TypographyPage from "#templates/TypographyPage";

const router = createRouter({
  routes: [
    { name: "home", path: "/", component: HomePage },
    { name: "buttons", path: "/buttons", component: ButtonsPage },
    { name: "cards", path: "/cards", component: CardsPage },
    { name: "colors", path: "/colors", component: ColorsPage },
    { name: "comment", path: "/comment", component: CommentPage },
    { name: "depths", path: "/depths", component: DepthsPage },
    { name: "dropdown", path: "/dropdown", component: DropdownPage },
    { name: "iconography", path: "/iconography", component: IconographyPage },
    { name: "inputs", path: "/inputs", component: InputsPage },
    { name: "menu", path: "/menu", component: MenuPage },
    { name: "modal", path: "/modal", component: ModalPage },
    {
      name: "notifications",
      path: "/notifications",
      component: NotificationsPage,
    },
    { name: "promptInput", path: "/prompt-input", component: PromptInputPage },
    { name: "sidebar", path: "/sidebar", component: SidebarPage },
    { name: "toolbar", path: "/toolbar", component: ToolbarPage },
    { name: "topbar", path: "/topbar", component: TopbarPage },
    { name: "typography", path: "/typography", component: TypographyPage },
  ],
});

function App() {
  const { RouterProvider: Provider } = router;
  return (
    <ThemeProvider>
      <Provider />
    </ThemeProvider>
  );
}

export default App;
