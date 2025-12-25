// src/components/GpaCalculator.jsx
import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calculator,
  RotateCcw,
  X,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import './GpaCalculator.css';

function GpaCalculator({ onHide }) {
  const [calcMode, setCalcMode] = useState('GPA');
  const [courses, setCourses] = useState([{ grade: 'A', credits: 3, id: Date.now() }]);
  const [semesters, setSemesters] = useState([{ gpa: '', credits: '', id: Date.now() }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradePoints = { 'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0 };
  const gradeOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  const addCourse = () => setCourses([...courses, { grade: 'A', credits: 3, id: Date.now() + Math.random() }]);
  const removeCourse = (id) => courses.length > 1 && setCourses(courses.filter(c => c.id !== id));
  const updateCourse = (id, field, value) => setCourses(courses.map(c => (c.id === id ? { ...c, [field]: field === 'credits' ? Number(value) : value } : c)));

  const addSemester = () => setSemesters([...semesters, { gpa: '', credits: '', id: Date.now() + Math.random() }]);
  const removeSemester = (id) => semesters.length > 1 && setSemesters(semesters.filter(s => s.id !== id));
  const updateSemester = (id, field, value) => setSemesters(semesters.map(s => (s.id === id ? { ...s, [field]: Number(value) } : s)));

  const getClassificationInfo = (val) => {
    const num = parseFloat(val);
    if (num >= 4.5) return { text: 'First Class', color: '#28a745' };
    if (num >= 3.5) return { text: 'Second Class Upper (2:1)', color: '#17a2b8' };
    if (num >= 2.5) return { text: 'Second Class Lower (2:2)', color: '#ffc107' };
    if (num >= 1.5) return { text: 'Third Class', color: '#fd7e14' };
    if (num >= 1.0) return { text: 'Pass', color: '#dc3545' };
    return { text: 'Fail', color: '#721c24' };
  };

  const handleCalculate = () => {
    setLoading(true);
    setError('');
    try {
      if (calcMode === 'GPA') {
        const totalPoints = courses.reduce((t, c) => t + (gradePoints[c.grade] * c.credits), 0);
        const totalCredits = courses.reduce((t, c) => t + c.credits, 0);
        if (totalCredits === 0) throw new Error('Credits cannot be zero');
        setResult((totalPoints / totalCredits).toFixed(2));
      } else {
        let totalQP = 0, totalUnits = 0;
        semesters.forEach(s => {
          totalQP += s.gpa * s.credits;
          totalUnits += s.credits;
        });
        if (totalUnits === 0) throw new Error('Enter units for semesters');
        setResult((totalQP / totalUnits).toFixed(2));
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCourses([{ grade: 'A', credits: 3, id: Date.now() }]);
    setSemesters([{ gpa: '', credits: '', id: Date.now() }]);
    setResult(null);
    setError('');
  };

  return (
    <div className="gpa-container">
      <div className="gpa-header">
        <div className="mode-tabs">
          <button className={calcMode === 'GPA' ? 'active' : ''} onClick={() => { setCalcMode('GPA'); setResult(null); }}>
            <BookOpen size={14} style={{ marginRight: '6px' }} /> GPA
          </button>
          <button className={calcMode === 'CGPA' ? 'active' : ''} onClick={() => { setCalcMode('CGPA'); setResult(null); }}>
            <GraduationCap size={14} style={{ marginRight: '6px' }} /> CGPA
          </button>
        </div>
        <button className="close-x" onClick={onHide}><X size={20} /></button>
      </div>

      {error && <div className="gpa-error">{error}</div>}

      <div className="gpa-scroll-area">
        {calcMode === 'GPA' ? (
          courses.map((c, idx) => (
            <div key={c.id} className="course-row">
              <span className="row-label">C{idx + 1}</span>
              <select value={c.grade} onChange={e => updateCourse(c.id, 'grade', e.target.value)}>
                {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input type="number" min="0" placeholder="Units" value={c.credits} onChange={e => updateCourse(c.id, 'credits', e.target.value)} />
              <button className="del-btn" onClick={() => removeCourse(c.id)} disabled={courses.length <= 1}><Trash2 size={14} /></button>
            </div>
          ))
        ) : (
          semesters.map((s, idx) => (
            <div key={s.id} className="course-row sem-row">
              <span className="row-label">S{idx + 1}</span>
              <input type="number" step="0.01" min="0" placeholder="GPA" value={s.gpa} onChange={e => updateSemester(s.id, 'gpa', e.target.value)} />
              <input type="number" min="0" placeholder="Units" value={s.credits} onChange={e => updateSemester(s.id, 'credits', e.target.value)} />
              <button className="del-btn" onClick={() => removeSemester(s.id)} disabled={semesters.length <= 1}><Trash2 size={14} /></button>
            </div>
          ))
        )}

        {calcMode === 'GPA' ? (
          <button className="add-btn" onClick={addCourse}><Plus size={14} /> Add Course</button>
        ) : (
          <button className="add-btn" onClick={addSemester}><Plus size={14} /> Add Semester</button>
        )}
      </div>

      <div className="gpa-footer-actions">
        <button className="main-calc-btn" onClick={handleCalculate} disabled={loading}>
          <Calculator size={18} style={{ marginRight: '8px' }} /> {loading ? '...' : `Calculate ${calcMode}`}
        </button>
        <button className="reset-btn" onClick={reset}><RotateCcw size={18} /></button>
      </div>

      {result && (
        <div className="gpa-result-box">
          <div className="result-val">{result}</div>
          <div className="result-tag" style={{ background: getClassificationInfo(result).color }}>
            {getClassificationInfo(result).text}
          </div>
        </div>
      )}
    </div>
  );
}

export default GpaCalculator;
