import { useNavigate } from "react-router-dom";

const ThankYouPage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                <h1 style={{ color: 'var(--success)', marginBottom: '1rem' }}>🎉 Thank You!</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Your preferences were submitted successfully!</p>
                <button
                    onClick={() => navigate("/")}
                    className="primary-button"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
                >
                    View Recommendations
                </button>
            </div>
        </div>
    );
};

export default ThankYouPage;
