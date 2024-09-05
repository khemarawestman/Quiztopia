import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './CreateQuizPage.css';
import L from 'leaflet';

const blueIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Question {
  question: string;
  answer: string;
  location: {
    latitude: string;
    longitude: string;
  };
}

function CreateQuizPage() {
  const [quizName, setQuizName] = useState<string>('');  
  const [questions, setQuestions] = useState<Question[]>([]);  
  const [currentQuestion, setCurrentQuestion] = useState<string>('');  
  const [currentAnswer, setCurrentAnswer] = useState<string>(''); 
  const [currentLocation, setCurrentLocation] = useState<{ latitude: string | null; longitude: string | null }>({
    latitude: null,
    longitude: null,
  });  
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude.toString(), // Store as string
            longitude: position.coords.longitude.toString(), // Store as string
          });
          setErrorMessage(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === error.PERMISSION_DENIED) {
            setErrorMessage('Geolocation permission denied. Please allow location access to use this feature.');
          } else {
            setErrorMessage('Error getting location. Please try again.');
          }
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
    }
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setCurrentLocation({
          latitude: `${e.latlng.lat}`, // Keep as string
          longitude: `${e.latlng.lng}`, // Keep as string
        });
        setErrorMessage(null); 
      },
    });
    return null;
  };

  const handleAddQuestion = () => {
    if (currentQuestion && currentAnswer && currentLocation.latitude && currentLocation.longitude) {
      const newQuestion: Question = {
        question: currentQuestion,
        answer: currentAnswer,
        location: {
          latitude: currentLocation.latitude, // Already a string
          longitude: currentLocation.longitude, // Already a string
        },
      };
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion('');
      setCurrentAnswer(''); 
    } else {
      console.error('All fields must be filled and a location must be selected');
      setErrorMessage('Please complete all fields and select a location on the map.');
    }
  };

  const handleSubmitQuiz = async () => {
    const token = localStorage.getItem('token');

    if (questions.length === 0) {
      setErrorMessage('Please add at least one question');
      return;
    }

    try {
      for (let i = 0; i < questions.length; i++) {
        const quizData = {
          name: quizName,
          question: questions[i].question,
          answer: questions[i].answer,
          location: questions[i].location,
        };

        console.log('Quiz data to be sent:', JSON.stringify(quizData, null, 2));

        const response = await fetch('https://fk7zu3f4gj.execute-api.eu-north-1.amazonaws.com/quiz/question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(quizData),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error:', errorData);
          throw new Error(errorData.message || 'Failed to add question');
        }

        const data = await response.json();
        console.log('Question added successfully:', data);
      }

      setQuizName('');
      setQuestions([]);
      setCurrentQuestion('');
      setCurrentAnswer('');
      setCurrentLocation({ latitude: null, longitude: null });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating quiz:', error.message);
        setErrorMessage(error.message);
      } else {
        console.error('Error creating quiz:', error);
        setErrorMessage('An error occurred while creating the quiz.');
      }
    }
  };

  return (
    <div className="container">
      <h2>Create a Quiz</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <input
        type="text"
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
        placeholder="Quiz Name"
        required
      />
      <h3>Add Questions</h3>
      <input
        type="text"
        value={currentQuestion}
        onChange={(e) => setCurrentQuestion(e.target.value)}
        placeholder="Enter question"
        required
      />
      <input
        type="text"
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        placeholder="Enter answer"
        required
      />

      <div className="map-container">
        {currentLocation.latitude && currentLocation.longitude ? (
          <MapContainer
            center={[parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)]}
            zoom={13}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {questions.map((q, index) => (
              <Marker
                key={index}
                position={[parseFloat(q.location.latitude), parseFloat(q.location.longitude)]}
                icon={blueIcon}
              >
                <Popup>
                  {q.question} - {q.answer}
                </Popup>
              </Marker>
            ))}
            <Marker position={[parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)]} icon={blueIcon}>
              <Popup>Selected Location</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <p>Loading map...</p>
        )}
      </div>

      <button onClick={handleAddQuestion}>Add Question</button>
      <h4>Questions:</h4>
      <ul>
        {questions.map((q, index) => (
          <li key={index}>
            <p>Question: {q.question}</p>
            <p>Answer: {q.answer}</p>
            <p>Location: (Lat: {q.location.latitude}, Long: {q.location.longitude})</p>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmitQuiz}>Create Quiz</button>
    </div>
  );
}

export default CreateQuizPage;
