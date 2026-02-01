// import '../../styles/NewsCard.css';
import NewsCard from './NewsCard';

const dummyNews = [
    {
        title: 'Top 5 Destinations to Visit This Summer',
        summary: 'Explore the most trending places to visit this season...',
        date: 'May 10, 2025',
    },
    {
        title: 'Tips for Budget Traveling in Europe',
        summary: 'Make the most of your Euro trip without breaking the bank...',
        date: 'May 8, 2025',
    }
];

const NewsSection = () => {
    return (
        <section className="news-section">
            <h2>Latest News</h2>
            <div className="news-list">
                {dummyNews.map((item, index) => (
                    <NewsCard key={index} {...item} />
                ))}
            </div>
        </section>
    );
};

export default NewsSection;
