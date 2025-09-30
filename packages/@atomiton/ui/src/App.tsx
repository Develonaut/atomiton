import { ThemeProvider } from "#components/ThemeProvider";
import { createRouter, RouterProvider } from "@atomiton/router";

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
    { path: "/", component: HomePage },
    { path: "/buttons", component: ButtonsPage },
    { path: "/cards", component: CardsPage },
    { path: "/colors", component: ColorsPage },
    { path: "/comment", component: CommentPage },
    { path: "/depths", component: DepthsPage },
    { path: "/dropdown", component: DropdownPage },
    { path: "/iconography", component: IconographyPage },
    { path: "/inputs", component: InputsPage },
    { path: "/menu", component: MenuPage },
    { path: "/modal", component: ModalPage },
    { path: "/notifications", component: NotificationsPage },
    { path: "/prompt-input", component: PromptInputPage },
    { path: "/sidebar", component: SidebarPage },
    { path: "/toolbar", component: ToolbarPage },
    { path: "/topbar", component: TopbarPage },
    { path: "/typography", component: TypographyPage },
  ],
});

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
