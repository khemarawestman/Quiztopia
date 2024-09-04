import { Route, Routes } from 'react-router-dom';
import LoginPage from './components/pages/LoginPage/LoginPage';
import SignupPage from './components/pages/SignupPage/SignupPage';
import CreateQuizPage from './components/pages/CreateQuizPage/CreateQuizPage';
import QuizListPage from './components/pages/QuizListPage/QuizListPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css'
function App() {
  return (
    <Routes>
      <Route path="" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route
        path="/create-quiz"
        element={
          <PrivateRoute>
            <CreateQuizPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/quizzes"
        element={
          <PrivateRoute>
            <QuizListPage />
          </PrivateRoute>
        }
      />

    </Routes>
  );
}

export default App;
