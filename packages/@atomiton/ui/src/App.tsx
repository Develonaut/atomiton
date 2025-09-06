import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";

// Import template components directly
import HomePage from "./templates/HomePage";
import ButtonsPage from "./templates/ButtonsPage";
import CardsPage from "./templates/CardsPage";
import ColorsPage from "./templates/ColorsPage";
import CommentPage from "./templates/CommentPage";
import DepthsPage from "./templates/DepthsPage";
import DropdownPage from "./templates/DropdownPage";
import IconographyPage from "./templates/IconographyPage";
import InputsPage from "./templates/InputsPage";
import MenuPage from "./templates/MenuPage";
import ModalPage from "./templates/ModalPage";
import NotificationsPage from "./templates/NotificationsPage";
import PromptInputPage from "./templates/PromptInputPage";
import SidebarPage from "./templates/SidebarPage";
import ToolbarPage from "./templates/ToolbarPage";
import TopbarPage from "./templates/TopbarPage";
import TypographyPage from "./templates/TypographyPage";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buttons" element={<ButtonsPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/colors" element={<ColorsPage />} />
          <Route path="/comment" element={<CommentPage />} />
          <Route path="/depths" element={<DepthsPage />} />
          <Route path="/dropdown" element={<DropdownPage />} />
          <Route path="/iconography" element={<IconographyPage />} />
          <Route path="/inputs" element={<InputsPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/modal" element={<ModalPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/prompt-input" element={<PromptInputPage />} />
          <Route path="/sidebar" element={<SidebarPage />} />
          <Route path="/toolbar" element={<ToolbarPage />} />
          <Route path="/topbar" element={<TopbarPage />} />
          <Route path="/typography" element={<TypographyPage />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
