import { useNavigate } from "react-router-dom";

const ThankYouPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 Thank You!</h1>
            <p className="text-lg text-center mb-6">Your preferences were submitted successfully!</p>
            <button
                onClick={() => navigate("/")}
                className="bg-indigo-600 text-white px-6 py-3 rounded shadow"
            >
                View Recommendations
            </button>
        </div>
    );
};

export default ThankYouPage;
