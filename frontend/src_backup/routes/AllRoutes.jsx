import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../components/common/PrivateRoute";
import StepReview from "../components/features/survey/StepReview";
import AuthPage from "../pages/AuthPage";
import ProfilePage from "../pages/ProfilePage";
import SurveyPage from "../pages/SurveyPage";
import ThankYouPage from "../pages/ThankYou";
import HomePage from "../pages/HomePage";
import SavedPage from "../pages/SavePage";

export default function AllRoutes() {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />

                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/saved-destinations" element={<SavedPage />} />

                <Route path="/yatra" element={
                    <PrivateRoute>
                        <SurveyPage />
                    </PrivateRoute>
                } />

                <Route path="/thanku" element={
                    <PrivateRoute>
                        <ThankYouPage />
                    </PrivateRoute>
                } />

                <Route path="/review" element={
                    <PrivateRoute>
                        <StepReview />
                    </PrivateRoute>
                } />

                <Route path="*" element={<HomePage />} />
            </Routes>

        </>
    )
}