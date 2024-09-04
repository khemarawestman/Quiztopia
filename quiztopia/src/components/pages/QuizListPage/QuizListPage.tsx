import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './QuizListPage.css';
import L from 'leaflet';

const blueIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
});

Modal.setAppElement('#root');

interface Question {
  question: string;
  answer: string;
  location: {
    longitude: string;
    latitude: string;
  };
}

interface Quiz {
  quizId: string;
  userId: string;
  username: string;
  questions: Question[];
}

function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchQuizzes = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/quiz', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quizzes');
      }

      const data = await response.json();

      if (Array.isArray(data.quizzes)) {
        setQuizzes(data.quizzes);
        console.log('Fetched Quizzes:', data.quizzes); // Log the quizzes array
      } else {
        console.error('Unexpected data format:', data);
      }

    } catch (error) {
      console.error('Error fetching quizzes:', (error as Error).message);
      alert((error as Error).message || 'An unexpected error occurred.');
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    console.log('Deleting quiz with ID:', quizId); // Debugging line

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quiz');
      }

      setQuizzes(quizzes.filter(quiz => quiz.quizId !== quizId));
      alert('Quiz deleted successfully.');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting quiz:', error.message);
        alert(`Error deleting quiz: ${error.message}`);
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="quiz-container">
      <h2>All Quizzes</h2>
      <div className="quiz-list">
        {quizzes.map((quiz, index) => (
          <div key={`${quiz.quizId}-${index}`} className="quiz-item">
            <h3>Quiz ID: {quiz.quizId}</h3>
            <p>Created by: {quiz.username} (User ID: {quiz.userId})</p>

            
            <div className="button-container">
              <button onClick={() => openModal(quiz)} className="show-more-button">
                Show More
              </button>
              <button onClick={() => handleDeleteQuiz(quiz.quizId)} className="delete-button">
                Delete Quiz
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedQuiz && (
          <div>
            <div className="modal-header">
              <h2>Quiz Details: {selectedQuiz.quizId}</h2>
              <button onClick={closeModal} className="close-button">Close</button>
            </div>
            <p>Created by User ID: {selectedQuiz.userId}</p>
            <div className="map-container">
              <MapContainer
                center={[parseFloat(selectedQuiz.questions[0]?.location.latitude), parseFloat(selectedQuiz.questions[0]?.location.longitude)]}
                zoom={13}
                className="map-container"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {selectedQuiz.questions.map((question, index) => (
                  <Marker
                    key={`${question.location.latitude}-${question.location.longitude}-${index}`}
                    position={[parseFloat(question.location.latitude), parseFloat(question.location.longitude)]}
                    icon={blueIcon}
                  >
                    <Popup>{question.question} - {question.answer}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <h4>Questions:</h4>
            <div className="questions-list">
              {selectedQuiz.questions.map((question, index) => (
                <div key={`${question.question}-${index}`} className="question-item">
                  <p>Question: {question.question}</p>
                  <p>Answer: {question.answer}</p>
                  <p>Location: (Lat: {question.location.latitude}, Long: {question.location.longitude})</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default QuizListPage;
