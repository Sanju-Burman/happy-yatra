import Recommendation from "../components/map/recom";
import '../styles/home.css'
import NewsSection from '../components/news/NewsSection';

const HomePage = () => {
    return (
        <div className="home-container">
            <header className="banner">
                <h1>Welcome to Your Travel Companion</h1>
                <p>Explore destinations, read traveler thoughts, and stay updated with travel news.</p>
            </header>

            <section className="thoughts-section">
                <h2>Traveler Thoughts</h2>
                <p>“Traveling – it leaves you speechless, then turns you into a storyteller.” – Ibn Battuta</p>
            </section>

            <NewsSection />
            <Recommendation />
        </div>
    );
};
export default HomePage;