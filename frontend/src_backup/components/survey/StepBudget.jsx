import { useSurvey } from "../../context/SurveyContext";
import { useState } from "react";

const StepBudget = () => {
    const { formData, updateForm } = useSurvey();
    const [budget, setBudget] = useState(1000);

    const handleBudget = (e) => {
        setBudget(Number(e.target.value))
        // console.log(budget);
        updateForm({ budget });
    };

    return (
        <div className="fItem">
            <h2 className="text-2xl font-bold mb-4">What's your budget?</h2>

            <div className="mb-4">
                <input
                    type="range"
                    min="100"
                    max="15000"
                    step="100"
                    value={budget}
                    onChange={(e) => handleBudget(e)}
                    className="w-full"
                />
                <p className="text-center mt-2 text-lg font-medium">${budget}</p>
            </div>
        </div>
    );
};

export default StepBudget;
