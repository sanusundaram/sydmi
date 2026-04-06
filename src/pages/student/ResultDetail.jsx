import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export default function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/results/${id}`)
      .then(res => setResult(res.data.result))
      .catch(() => toast.error('Failed to load result details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><div className="spinner mx-auto mt-20" /></div>;
  if (!result) return null;

  const chartData = result.skillGaps.map(sg => ({
    subject: sg.topic,
    A: sg.score,
    fullMark: 100,
  }));

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/results" className="text-secondary text-sm hover:underline mb-2 block">← Back to Results</Link>
          <h1 className="text-2xl font-bold">{result.quiz?.title}</h1>
          <p className="text-muted">Student: {result.student?.name}</p>
        </div>
      </div>

      <div className="grid-4 mb-8">
        <div className="stat-card">
          <div className="stat-label">Final Score</div>
          <div className={`text-3xl font-bold mt-2 ${result.passed ? 'text-success' : 'text-danger'}`}>
            {result.score}%
          </div>
          <div className="mt-2">{result.passed ? '✅ Passed' : '❌ Failed'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Correct Answers</div>
          <div className="text-2xl font-bold mt-2">{result.correctAnswers} / {result.totalQuestions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Time Taken</div>
          <div className="text-2xl font-bold mt-2">{formatTime(result.timeTaken)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Weak Topics</div>
          <div className="text-2xl font-bold mt-2 text-warning">
            {result.skillGaps.filter(sg => sg.strength === 'weak').length}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Radar Chart */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Skill Domain Radar</h3>
          <p className="text-sm text-muted mb-6">Visualizes your strengths across different topics.</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
                <Radar name="Score" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Performance by Topic</h3>
          <p className="text-sm text-muted mb-6">Percentage score in each individual topic evaluated.</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} cursor={{ fill: 'var(--glass)' }} />
                <Bar dataKey="A" name="Score %" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.A >= 75 ? 'var(--success)' : entry.A >= 50 ? 'var(--warning)' : 'var(--danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metacognitive Analysis Section */}
      {result.metacognition && (result.metacognition.dunningKrugerCount > 0 || result.metacognition.imposterSyndromeCount > 0) && (
        <div className="mb-8">
          <h3 className="font-bold text-xl mb-4">🧠 Metacognitive Analysis</h3>
          <div className="grid-2">
            
            {result.metacognition.dunningKrugerCount > 0 && (
              <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                  <h4 className="font-bold text-lg text-danger">Dunning-Kruger Effect</h4>
                </div>
                <p className="text-sm text-muted mb-4">
                  You answered <strong>{result.metacognition.dunningKrugerCount}</strong> question(s) incorrectly despite having <strong>High Confidence</strong>. 
                  These represent dangerous blind spots in your knowledge.
                </p>
                {result.metacognition.dunningKrugerTopics.length > 0 && (
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <span className="text-xs font-semibold text-muted">Review Topics:</span>
                    {result.metacognition.dunningKrugerTopics.map(t => (
                      <span key={t} className="badge badge-danger" style={{ padding: '2px 8px', fontSize: '10px' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result.metacognition.imposterSyndromeCount > 0 && (
              <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div style={{ fontSize: '1.5rem' }}>🤔</div>
                  <h4 className="font-bold text-lg text-warning">Imposter Syndrome</h4>
                </div>
                <p className="text-sm text-muted mb-4">
                  You answered <strong>{result.metacognition.imposterSyndromeCount}</strong> question(s) correctly while having <strong>Low Confidence</strong>. 
                  Trust your instincts! You know this material better than you think.
                </p>
                {result.metacognition.imposterTopics.length > 0 && (
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <span className="text-xs font-semibold text-muted">Strengthen Confidence In:</span>
                    {result.metacognition.imposterTopics.map(t => (
                      <span key={t} className="badge badge-warning" style={{ padding: '2px 8px', fontSize: '10px' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Review Section */}
      <h3 className="font-bold text-xl mb-4">Detailed Skill Breakdown</h3>
      <div className="grid-3">
        {result.skillGaps.map(sg => (
          <div key={sg.topic} className="glass-card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">{sg.topic}</span>
              <span className={`badge ${sg.strength === 'strong' ? 'badge-success' : sg.strength === 'average' ? 'badge-warning' : 'badge-danger'}`}>
                {sg.strength.toUpperCase()}
              </span>
            </div>
            <div className="text-3xl font-bold mb-3">{sg.score}%</div>
            <div className="text-sm text-muted mb-1">Answered: <span className="text-primary">{sg.correctAnswers} / {sg.totalQuestions}</span></div>
            <div className="w-full bg-surface-3 h-1.5 rounded-full mt-2">
               <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${sg.score}%`, 
                    background: sg.strength === 'strong' ? 'var(--success)' : sg.strength === 'average' ? 'var(--warning)' : 'var(--danger)' 
                  }} 
                />
            </div>
            {sg.strength === 'weak' && (
              <div className="mt-4 text-xs p-2 bg-danger/10 border border-danger/20 text-danger rounded">
                ⚠️ Needs Review. Consider studying more on this topic.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
