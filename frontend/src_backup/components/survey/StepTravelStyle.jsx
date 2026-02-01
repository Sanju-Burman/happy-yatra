import { useSurvey } from "../../context/SurveyContext";

const options = ["Solo", "Family", "Luxury", "Backpacking", "Romantic"];

const StepTravelStyle = () => {
    const { formData, updateForm } = useSurvey();

    const handleSelect = (style) => {
        updateForm({ travelStyle: style });
        // console.log("oooooo"+formData+"uuu"+style)
    };

    return (
        <div className="fItem">
            <h2 className="text-2xl font-bold mb-4">What's your travel style?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {options.map((style) => (
                    <button
                        key={style}
                        onClick={() => handleSelect(style)}
                        aria-pressed={formData.travelStyle === style}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StepTravelStyle;