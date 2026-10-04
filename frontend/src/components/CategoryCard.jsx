import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link to={`/listings?category=${encodeURIComponent(category.name)}`} className="card category-card">
      <span className="cat-icon">{category.icon}</span>
      <span>{category.name}</span>
    </Link>
  );
}
