import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminOverview() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes/all')
      .then(res => setQuizzes(res.data.quizzes))
      .catch(() => toast.error('Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteQuizz = async (id) => {
    if (!window.confirm('Delete this quiz system-wide?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted');
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="page">
       <div className="page-header mb-8">
        <h1 className="page-title">System Overview</h1>
        <p className="page-subtitle">Global view of all assessments across the platform.</p>
      </div>

       {loading ? (
        <div className="spinner mx-auto mt-10" />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Author</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz._id}>
                  <td className="font-semibold">{quiz.title}</td>
                  <td>{quiz.createdBy?.name || 'Deleted User'}</td>
                  <td>{quiz.subject}</td>
                  <td>
                    <span className={`badge ${quiz.isPublished ? 'badge-success' : 'badge-warning'}`}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{quiz.attempts}</td>
                  <td>
                     <button onClick={() => handleDeleteQuizz(quiz._id)} className="btn btn-danger btn-sm">Delete</button>
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
