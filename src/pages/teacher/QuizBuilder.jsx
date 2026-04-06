import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';

export default function QuizBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [quizDetails, setQuizDetails] = useState({
    title: '',
    subject: '',
    description: '',
    timeLimit: 30,
    passingScore: 60,
    difficulty: 'intermediate',
    isPublished: false
  });

  const [questions, setQuestions] = useState([{
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    topic: '',
    explanation: '',
    difficulty: 'medium'
  }]);

  useEffect(() => {
    if (isEdit) {
      api.get(`/quizzes/${id}`)
        .then(res => {
          const { title, subject, description, timeLimit, passingScore, difficulty, isPublished, questions } = res.data.quiz;
          setQuizDetails({ title, subject, description, timeLimit, passingScore, difficulty, isPublished });
          setQuestions(questions.length ? questions : [{ text: '', options: ['', '', '', ''], correctAnswer: 0, topic: '', explanation: '', difficulty: 'medium' }]);
        })
        .catch(() => toast.error('Failed to load quiz'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!quizDetails.title || !quizDetails.subject) return toast.error('Title and Subject are required');
    if (questions.some(q => !q.text || q.options.some(o => !o) || !q.topic)) {
      return toast.error('All questions must be fully filled out');
    }

    setSaving(true);
    const payload = { ...quizDetails, questions };
    
    try {
      if (isEdit) {
        await api.put(`/quizzes/${id}`, payload);
        toast.success('Quiz updated');
      } else {
        await api.post('/quizzes', payload);
        toast.success('Quiz created');
      }
      navigate('/manage/quizzes');
    } catch (err) {
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, topic: '', explanation: '', difficulty: 'medium' }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length === 1) return toast.error('Quiz must have at least one question');
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  if (loading) return <div className="page"><div className="spinner mx-auto mt-20" /></div>;

  return (
    <div className="page max-w-4xl mx-auto pb-24">
      <div className="mb-6">
         <button onClick={() => navigate('/manage/quizzes')} className="btn btn-ghost btn-sm mb-4">← Back to Quizzes</button>
         <h1 className="page-title text-3xl font-bold text-primary-dark">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>
         <p className="text-muted mt-2">Design your assessment and set parameters.</p>
      </div>

      <div className="glass-card p-8 mb-8 border border-border shadow-sm">
        <h2 className="font-bold text-lg mb-4 border-b border-border pb-2">Quiz Details</h2>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={quizDetails.title} onChange={e => setQuizDetails({...quizDetails, title: e.target.value})} placeholder="E.g. Midterm Physics" />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input className="form-input" value={quizDetails.subject} onChange={e => setQuizDetails({...quizDetails, subject: e.target.value})} placeholder="E.g. Physics" />
          </div>
          <div className="form-group col-span-2" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" value={quizDetails.description} onChange={e => setQuizDetails({...quizDetails, description: e.target.value})} placeholder="Brief instructions..." />
          </div>
          <div className="form-group">
            <label className="form-label">Time Limit (mins)</label>
            <input type="number" className="form-input" value={quizDetails.timeLimit} onChange={e => setQuizDetails({...quizDetails, timeLimit: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label className="form-label">Passing Score (%)</label>
            <input type="number" className="form-input" value={quizDetails.passingScore} onChange={e => setQuizDetails({...quizDetails, passingScore: Number(e.target.value)})} />
          </div>
           <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select className="form-input" value={quizDetails.difficulty} onChange={e => setQuizDetails({...quizDetails, difficulty: e.target.value})}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group flex justify-center flex-col mt-6 bg-surface-2 p-4 rounded-lg border border-border">
            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold select-none">
              <input type="checkbox" className="w-5 h-5 accent-primary" checked={quizDetails.isPublished} onChange={e => setQuizDetails({...quizDetails, isPublished: e.target.checked})} />
              <span>Publish Immediately (Visible to students)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Questions ({questions.length})</h2>
        <button className="btn btn-secondary btn-sm" onClick={addQuestion}>
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="flex-col gap-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="glass-card p-6 relative group">
            <button 
              className="absolute top-4 right-4 text-muted hover:text-danger p-2"
              onClick={() => removeQuestion(qIdx)}
            >
              <Trash2 size={18} />
            </button>
            
            <div className="grid-2 gap-4 mb-4" style={{ paddingRight: '40px' }}>
              <div className="form-group">
                <label className="form-label">Question {qIdx + 1}</label>
                <input className="form-input" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Type question..." />
              </div>
              <div className="form-group">
                <label className="form-label">Topic / Skill Category</label>
                <input className="form-input" value={q.topic} onChange={e => updateQuestion(qIdx, 'topic', e.target.value)} placeholder="E.g. Algebra" />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label text-sm text-info">Optional Hint (Costs 25% of points if used)</label>
              <input className="form-input text-sm" value={q.explanation || ''} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} placeholder="E.g. Remember to carry the 1..." />
            </div>

            <label className="form-label mt-4 block">Options &amp; Correct Answer</label>
            <div className="grid-2 gap-4 mt-2">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-3" style={{ padding: '16px', borderRadius: 'var(--radius)', border: `1px solid ${q.correctAnswer === oIdx ? 'var(--success)' : 'var(--border)'}`, background: q.correctAnswer === oIdx ? 'rgba(34,197,94,0.1)' : 'var(--surface)', transition: 'var(--transition)' }}>
                  <input 
                    type="radio" 
                    name={`q-${qIdx}-correct`} 
                    checked={q.correctAnswer === oIdx} 
                    onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--success)', cursor: 'pointer', marginLeft: '4px' }}
                  />
                  <input 
                    className="form-input" 
                    style={{ flex: 1, padding: '8px 12px', border: 'none', background: 'transparent', boxShadow: 'none' }}
                    value={opt} 
                    onChange={e => updateOption(qIdx, oIdx, e.target.value)} 
                    placeholder={`Option ${oIdx + 1} text...`} 
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end gap-4 p-6 bg-surface/80 backdrop-blur-md border border-border rounded-xl sticky bottom-4 z-20 shadow-md">
        <button onClick={() => navigate('/manage/quizzes')} className="btn btn-ghost">Cancel</button>
        <button className="btn btn-primary px-8" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Quiz'}
        </button>
      </div>
    </div>
  );
}
