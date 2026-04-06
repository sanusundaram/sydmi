import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  
  // Format: { [qIndex]: { selectedOption, confidence: 'medium', usedHint: false } }
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then(res => {
        setQuiz(res.data.quiz);
        setTimeLeft(res.data.quiz.timeLimit * 60);
      })
      .catch((err) => {
        toast.error('Quiz not found or inaccessible');
        navigate('/quizzes');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, timeLeft]);

  const updateAnswerState = (qIndex, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [qIndex]: {
        ...(prev[qIndex] || { confidence: 'medium', usedHint: false }),
        [field]: value
      }
    }));
  };

  const handleShowHint = (qIndex) => {
    if (window.confirm("Using a hint will deduct 25% of the points for this question. Continue?")) {
      updateAnswerState(qIndex, 'usedHint', true);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Format answers array mapping to questions index
    const submissionAnswers = quiz.questions.map((_, idx) => answers[idx] || {});
    
    try {
      const timeTaken = (quiz.timeLimit * 60) - timeLeft;
      const res = await api.post('/results', { quizId: id, answers: submissionAnswers, timeTaken });
      toast.success('Quiz submitted successfully!');
      navigate(`/results/${res.data.result._id}`);
    } catch (err) {
      toast.error('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page"><div className="spinner mx-auto mt-6" style={{margin:'40px auto'}} /></div>;
  if (!quiz) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      
      <div className="glass-card flex items-center justify-between mb-6" style={{ position: 'sticky', top: '20px', zIndex: 100, padding: '16px 24px' }}>
        <div>
          <h1 className="font-bold" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{quiz.title}</h1>
          <p className="text-sm text-muted">{quiz.subject}</p>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft < 60 ? 'var(--danger)' : 'var(--primary)' }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (window.confirm('Are you sure you want to submit?')) handleSubmit();
            }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>

      <div className="flex-col gap-6 mb-6">
        {quiz.questions.map((q, qIndex) => {
          const ansState = answers[qIndex] || { confidence: 'medium', usedHint: false };
          
          return (
            <div key={q._id} className="glass-card" style={{ padding: '24px' }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold" style={{ fontSize: '1.125rem', maxWidth: '80%' }}>
                  <span style={{ color: 'var(--primary)', marginRight: '8px' }}>{qIndex + 1}.</span> {q.text}
                </h3>
                <span className="badge" style={{background: 'var(--surface-2)', color: 'var(--primary)'}}>{q.topic}</span>
              </div>
              
              <div className="flex-col gap-3 mt-4">
                {q.options.map((opt, oIndex) => {
                  const isSelected = ansState.selectedOption === oIndex;
                  return (
                    <label 
                      key={oIndex} 
                      className="quiz-option"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(0, 70, 67, 0.05)' : 'var(--surface)',
                        transition: 'all var(--transition)'
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`question-${qIndex}`} 
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                        checked={isSelected}
                        onChange={() => updateAnswerState(qIndex, 'selectedOption', oIndex)}
                      />
                      <span style={{ fontSize: '1rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt}</span>
                    </label>
                  );
                })}
              </div>

              {/* Metacognition & Hint Section */}
              <div className="flex items-center justify-between mt-6" style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-muted">Confidence:</span>
                  <select 
                    className="form-input text-sm"
                    style={{ padding: '6px 12px', width: 'auto', minWidth: '120px' }}
                    value={ansState.confidence}
                    onChange={(e) => updateAnswerState(qIndex, 'confidence', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {q.explanation && (
                  <div>
                    {!ansState.usedHint ? (
                       <button className="btn btn-secondary btn-sm" onClick={() => handleShowHint(qIndex)}>
                         💡 Show Hint (-25%)
                       </button>
                    ) : (
                       <div className="text-sm text-warning" style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius)' }}>
                         <strong>Hint: </strong> {q.explanation}
                       </div>
                    )}
                  </div>
                )}
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
