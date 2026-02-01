import '../../../styles/newsCard.css';

const NewsCard = ({ title, summary, date }) => {
    return (
        <div className="news-card">
            <h3>{title}</h3>
            <p>{summary}</p>
            <span className="news-date">{date}</span>
        </div>
    );
};

export default NewsCard;
