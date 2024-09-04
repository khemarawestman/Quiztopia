// components/Navbar.tsx
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav>
      <ul className="navbar">
        <li>
          <Link to="/">Login</Link>
        </li>
        <li>
          <Link to="/register">Sign Up</Link>
        </li>
        <li>
          <Link to="/create-quiz">Create Quiz</Link>
        </li>
        <li>
          <Link to="/quizzes">Quizzes</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
