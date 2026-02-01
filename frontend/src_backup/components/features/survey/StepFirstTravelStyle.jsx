import { useSurvey } from "../../../context/SurveyContext";

const StepFirstTravelStyle = () => {
    const { formData, updateForm } = useSurvey();
    const options = ["Solo", "Family", "Luxury", "Backpacking", "Romantic"];

    const handleSelect = (style) => {
        updateForm({ travelStyle: style });
    };

    return (
        <div className="form-item">
            <h2 className="form-title">What's your travel style?</h2>
            <div className="options-grid">
                {options.map((style) => (
                    <button
                        key={style}
                        onClick={() => handleSelect(style)}
                        className={`option-button ${formData.travelStyle === style ? 'selected' : ''}`}
                        aria-pressed={formData.travelStyle === style}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>
    );
};
export default StepFirstTravelStyle;
