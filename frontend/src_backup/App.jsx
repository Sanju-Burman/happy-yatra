import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/homePage";
import SurveyPage from "./pages/surveyPage";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import StepReview from "./components/survey/StepReview";
import ThemeToggleButton from "./components/themeToggleButton";
import { ThemeProvider } from "./context/ThemeContext";
import ThankYouPage from "./pages/thanku";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/profilePage";
// import RecommendationPage from "./pages/recomPage";

function App() {

  return (
    <ThemeProvider>

      <Router>
        <Navbar />
        <main className="main-content">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/yatra" element={<SurveyPage />} />
            <Route path="/thanku" element={<ThankYouPage />} />
            <Route path="/review" element={<StepReview />} />
            {/* <Route path="/recommendations" element={<RecommendationPage />} /> */}

            <Route path="*" element={<Home />} /> {/* fallback */}
          </Routes>
        </main>
        <Footer />
        <ThemeToggleButton />
      </Router>
    </ThemeProvider>
  )
}

export default App
