import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = () => {
    api.get('/quizzes')
      .then(res => setQuizzes(res.data.quizzes))
      .catch(() => toast.error('Failed to load quizzes'))
      .finally(() => setLoading(false));
  };

  const handleTogglePublish = async (quiz) => {
    try {
      await api.put(`/quizzes/${quiz._id}`, { isPublished: !quiz.isPublished });
      toast.success(`Quiz ${!quiz.isPublished ? 'published' : 'unpublished'}`);
      setQuizzes(quizzes.map(q => q._id === quiz._id ? { ...q, isPublished: !q.isPublished } : q));
    } catch (err) {
      toast.error('Failed to update quiz status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted');
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Manage Quizzes</h1>
          <p className="page-subtitle">Create, edit, and organize your assessments.</p>
        </div>
        <Link to="/manage/quizzes/create" className="btn btn-primary">
          <span>+</span> Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="spinner mx-auto mt-10" />
      ) : quizzes.length === 0 ? (
        <div className="empty-state glass-card mt-10">
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">No Quizzes Created Yet</h3>
          <p className="empty-desc">Start building assessments to evaluate your students' knowledge.</p>
          <Link to="/manage/quizzes/create" className="btn btn-primary mt-4">Create First Quiz</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title / Subject</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz._id}>
                  <td>
                    <div className="font-semibold">{quiz.title}</div>
                    <div className="text-xs text-muted mt-1">{quiz.subject}</div>
                  </td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td>
                    <button 
                      onClick={() => handleTogglePublish(quiz)}
                      className={`badge border-0 cursor-pointer ${quiz.isPublished ? 'badge-success' : 'badge-warning'}`}
                    >
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td>{quiz.attempts} <span className="text-muted text-xs">takes</span></td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/manage/quizzes/${quiz._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button onClick={() => handleDelete(quiz._id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
