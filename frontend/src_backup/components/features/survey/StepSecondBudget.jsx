import { useSurvey } from "../../../context/SurveyContext";
import { useState } from "react";

const StepSecondBudget = () => {
    const { formData, updateForm } = useSurvey();
    const [budget, setBudget] = useState(formData.budget || 1000); // Initialize with formData or default

    const handleBudget = (e) => {
        const newBudget = Number(e.target.value);
        setBudget(newBudget);
        updateForm({ budget: newBudget });
    };

    return (
        <div className="form-item">
            <h2 className="form-title">What's your budget?</h2>
            <div className="budget-slider-container">
                <input
                    type="range"
                    min="100"
                    max="15000"
                    step="100"
                    value={budget}
                    onChange={handleBudget}
                    className="budget-slider"
                />
                <p className="budget-display">${budget}</p>
            </div>
        </div>
    );
};
export default StepSecondBudget;
