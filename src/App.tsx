import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FindHousingPage } from "./pages/FindHousingPage.tsx";
import { FindRoommatesPage } from "./pages/FindRoommatesPage.tsx";
import { HasListingPage } from "./pages/HasListingPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { MePage } from "./pages/MePage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { SeekTogetherPage } from "./pages/SeekTogetherPage.tsx";
import { SharedSpacePage } from "./pages/SharedSpacePage.tsx";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/roommates" element={<FindRoommatesPage />} />
        <Route path="/housing" element={<FindHousingPage />} />
        <Route path="/space" element={<SharedSpacePage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/start/has-listing" element={<HasListingPage />} />
        <Route path="/start/seek-together" element={<SeekTogetherPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
