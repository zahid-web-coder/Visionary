import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import './App.css';
import { Link } from 'react-router-dom';

const videoConstraints = {
  width: 1040,
  height: 3080,
  facingMode: 'user',
};

const App = () => {
  const [emotion, setEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [musicTrack, setMusicTrack] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [timer, setTimer] = useState(20);
  const [showIntro, setShowIntro] = useState(true); // Added this line
  const webcamRef = useRef(null);

  const captureEmotion = async (historyRef) => {
    if (!webcamRef.current) return;
    const image = webcamRef.current.getScreenshot();
    if (!image) return;

    try {
      // const response = await fetch('https://81b9-119-161-97-140.ngrok-free.app/detect_emotion', 
      const response = await fetch('http://127.0.0.1:5001/detect_emotion',
        {
          
          //------------------------------------------------

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      if (data.emotion) {
        historyRef.current.push(data.emotion);
        setEmotionHistory([...historyRef.current]);
      }
    } catch (error) {
      console.error('Error fetching emotion:', error);
    }
  };

  const startCapture = async () => {
    console.log('Starting emotion capture...');
    setCapturing(true);
    setTimer(20);
    setEmotionHistory([]);
    setSelectedSection(null);

    const historyRef = { current: [] };

    const interval = setInterval(() => {
      captureEmotion(historyRef);
    }, 2000);

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setCapturing(false);

      const emotionCounts = {};
      historyRef.current.forEach(e => {
        emotionCounts[e] = (emotionCounts[e] || 0) + 1;
      });

      const dominantEmotion = getDominantEmotion(historyRef.current);
      console.log('🎯 Dominant emotion detected:', dominantEmotion);
      setEmotion(dominantEmotion);
      fetchBookSuggestions(dominantEmotion);
      fetchAIYogaSuggestions(dominantEmotion);
      fetchYoutubeVideos(dominantEmotion);
      fetchMusic(dominantEmotion);
    }, 20000);
  };

  const getDominantEmotion = (emotions) => {
    if (!emotions || emotions.length === 0) return 'neutral';

    const count = {};
    emotions.forEach(e => {
      count[e] = (count[e] || 0) + 1;
    });

    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'neutral';
  };

  const fetchBookSuggestions = async (emotion) => {
    const query = emotion === 'sad' ? 'self-help+mindfulness' :
      emotion === 'angry' ? 'calm+meditation' :
      emotion === 'happy' ? 'inspirational+stories' : 'emotional+balance';
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`);
      const json = await res.json();
      if (json.items && json.items.length > 0) {
        const books = json.items.map(item => {
          const book = item.volumeInfo;
          return {
            title: book.title,
            authors: book.authors?.join(', '),
            thumbnail: book.imageLinks?.thumbnail,
            link: book.infoLink,
          };
        });
        setBookSuggestions(books);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  const fetchAIYogaSuggestions = async (emotion) => {
    const prompt = `Suggest 5 short, practical yoga or exercise routines suitable for someone feeling ${emotion}. Make sure they can be done at home, without equipment. List them as bullet points.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a mindful fitness coach.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content;

      if (aiText) {
        const steps = aiText.split('\n').filter(line => line.trim() && /^[\d\-•]/.test(line));
        setExerciseSuggestions(steps);
      }
    } catch (error) {
      console.error('Error fetching AI yoga suggestions:', error);
    }
  };

  const fetchYoutubeVideos = async (emotion) => {
    const query = `yoga for ${emotion} mood`;
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=2&key=AIzaSyCLUVTYUchn5wqR6wXT3pmOXb53MJov4kA`);
      const json = await res.json();
      const videos = json.items.map(item => `https://www.youtube.com/watch?v=${item.id.videoId}`);
      setYoutubeVideos(videos);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  const fetchMusic = (emotion) => {
    const musicMap = {
      sad: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
      angry: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
      neutral: 'https://www.youtube.com/watch?v=Lju6h-C37hE',
      happy: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs'
    };
    setMusicTrack(musicMap[emotion] || musicMap['neutral']);
  };

  const introMessages = [
    "Let's reflect on your emotions... 🌈",
    "We care about your mental well-being 💚",
    "Your mind matters. Always. 🧠",
    "Mental health is our responsibility 🤝",
    "Feel, reflect, and vibe freely 🌿"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % introMessages.length);
    }, 4000);

    const timer = setTimeout(() => {
      clearInterval(messageInterval);
      setShowIntro(false);
    }, 20000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="app">
      <div className="main-content">
        <h1 className="title">VIBE_SYNC</h1>

        {showIntro && (
          <p className="animated-text">{introMessages[currentMessage]}</p>
        )}

        <button className="scan-button" onClick={startCapture} disabled={capturing}>
          {capturing ? `Analyzing... (${timer}s)` : 'Start 20s Emotion Scan'}
        </button>

        {/* New chatbot button */}
        <Link to="/chatbot" className="chat-button">
          Chat with our AI Assistant
        </Link>

        {emotion && (
          <div className="result">
            <h2 className="emotion">Dominant Emotion: {emotion}</h2>
            <div className="section-buttons">
              <button onClick={() => setSelectedSection('books')}>📚 Book Suggestions</button>
              <button onClick={() => setSelectedSection('yoga')}>🧘 Yoga/Exercise</button>
              <button onClick={() => setSelectedSection('music')}>🎵 Music</button>
            </div>

            {selectedSection === 'books' && bookSuggestions.length > 0 && (
              <div className="book-list">
                <h3>📚 Book Recommendations</h3>
                {bookSuggestions.map((book, idx) => (
                  <div key={idx} className="book">
                    <img src={book.thumbnail} alt={book.title} />
                    <p className="book-title">{book.title}</p>
                    <p className="book-author">by {book.authors}</p>
                    <a href={book.link} target="_blank" rel="noreferrer">Read More</a>
                  </div>
                ))}
              </div>
            )}

            {selectedSection === 'yoga' && (
              <div className="exercise-list">
                <h3>🏃 AI Yoga Suggestions</h3>
                <ul>
                  {exerciseSuggestions.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
                <h4>🎥 YouTube Yoga Videos</h4>
                {youtubeVideos.map((url, idx) => (
                  <div key={idx}>
                    <a href={url} target="_blank" rel="noreferrer">Watch Video {idx + 1}</a>
                  </div>
                ))}
              </div>
            )}

            {selectedSection === 'music' && musicTrack && (
              <div className="music-section">
                <h3>🎶 Recommended Music</h3>
                <a href={musicTrack} target="_blank" rel="noreferrer">Play Music</a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="webcam-container">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="webcam"
        />
      </div>
    </div>
  );
};

export default App;