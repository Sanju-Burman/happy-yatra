import { useSurvey } from "../context/SurveyContext";
import StepTravelStyle from "../components/survey/StepTravelStyle";
import StepBudget from "../components/survey/StepBudget";
import StepActivities from "../components/survey/StepActivities";
import StepInterests from "../components/survey/StepInterests";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import '../styles/form.css'
// Import other steps as you build them

const SurveyPage = () => {
    const { formData } = useSurvey();
    const navigate = useNavigate();

    useEffect(() => {
        if (!formData) {
            navigate("/yatra"); 
        }
    }, [formData, navigate]);
    const handleReviewClick = () => {
        navigate("/review");
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6 form">
            <StepTravelStyle />
            <StepBudget />
            <StepInterests />
            <StepActivities />
            <div className="subBtn">
                <button
                    type="button"
                    onClick={handleReviewClick}
                    className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 transition"
                >
                    Review & Submit
                </button>
            </div>
        </div>
    );
};

export default SurveyPage;