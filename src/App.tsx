import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage.tsx";
import { FindHousingPage } from "./pages/FindHousingPage.tsx";
import { FindRoommatesPage } from "./pages/FindRoommatesPage.tsx";
import { HasListingPage } from "./pages/HasListingPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { ListingDetailPage } from "./pages/ListingDetailPage.tsx";
import { ListingsPage } from "./pages/ListingsPage.tsx";
import { MePage } from "./pages/MePage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { OnboardingPage } from "./pages/OnboardingPage.tsx";
import { PublishRoomPage } from "./pages/PublishRoomPage.tsx";
import { RentSplitPage } from "./pages/RentSplitPage.tsx";
import { RoommateDetailPage } from "./pages/RoommateDetailPage.tsx";
import { RoomDetailPage } from "./pages/RoomDetailPage.tsx";
import { RulesPage } from "./pages/RulesPage.tsx";
import { SearchStandardPage } from "./pages/SearchStandardPage.tsx";
import { SeekTogetherPage } from "./pages/SeekTogetherPage.tsx";
import { SharedSpacePage } from "./pages/SharedSpacePage.tsx";
import { TogetherPage } from "./pages/TogetherPage.tsx";
import { ViewingPage } from "./pages/ViewingPage.tsx";
import { WorkplacePage } from "./pages/WorkplacePage.tsx";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/roommates" element={<FindRoommatesPage />} />
        <Route path="/roommates/:personId/chat" element={<ChatPage />} />
        <Route path="/roommates/:personId" element={<RoommateDetailPage />} />
        <Route path="/housing/publish" element={<PublishRoomPage />} />
        <Route path="/housing/rooms/:roomId" element={<RoomDetailPage />} />
        <Route path="/housing/listings/:personId/:listingId" element={<ListingDetailPage />} />
        <Route path="/housing/listings/:personId" element={<ListingsPage />} />
        <Route path="/housing/workplace" element={<WorkplacePage />} />
        <Route path="/housing" element={<FindHousingPage />} />
        <Route path="/together/:personId/viewing" element={<ViewingPage />} />
        <Route path="/together/:personId/search" element={<SearchStandardPage />} />
        <Route path="/together/:personId/rent" element={<RentSplitPage />} />
        <Route path="/together/:personId/rules" element={<RulesPage />} />
        <Route path="/together/:personId" element={<TogetherPage />} />
        <Route path="/space/:personId" element={<SharedSpacePage />} />
        <Route path="/space" element={<SharedSpacePage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/start/has-listing" element={<HasListingPage />} />
        <Route path="/start/seek-together" element={<SeekTogetherPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
