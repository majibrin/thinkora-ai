// frontend/src/components/GpaCalculator.jsx (FULL CALCULATION LOGIC)

import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext'; // Will be used later for fetching data

// Define the initial course list for demonstration
const initialCourses = [
  { id: 1, name: 'CST 101', credits: 3, grade: 'A' },
  { id: 2, name: 'MTH 102', credits: 4, grade: 'B' },
  { id: 3, name: 'ENG 101', credits: 2, grade: 'C' },
];

// Helper function to convert letter grade to point value (4.0 scale)
const getGradePoint = (grade) => {
  // Ensure case-insensitivity
  const upperCaseGrade = grade.toUpperCase();
  switch (upperCaseGrade) {
    case 'A':
      return 4.0;
    case 'B':
      return 3.0;
    case 'C':
      return 2.0;
    case 'D':
      return 1.0;
    case 'F':
      return 0.0;
    default:
      // Return 0 for invalid or missing grades
      return 0.0; 
  }
};


function GpaCalculator({ onHide }) {
  const [courses, setCourses] = useState(initialCourses);
  const [gpa, setGpa] = useState(null);
  
  // 🛑 IMPLEMENTATION OF THE CORE GPA CALCULATION LOGIC
  const calculateGpa = () => {
    let totalQualityPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      // 1. Get the numerical point value for the grade
      const gradePoint = getGradePoint(course.grade); 
      
      // 2. Calculate Quality Points (Credits * Grade Point)
      const qualityPoints = course.credits * gradePoint;
      
      // 3. Accumulate totals
      totalQualityPoints += qualityPoints;
      totalCredits += course.credits;
    });

    if (totalCredits === 0) {
      setGpa(0.00);
      return;
    }
    
    // 4. Calculate final GPA and round to two decimal places
    const finalGpa = (totalQualityPoints / totalCredits).toFixed(2);
    setGpa(finalGpa);
  };


  return (
    <div className="gpa-calculator-container" style={{ marginTop: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>

      <h4>📊 Grade Point Average (GPA) Calculator</h4>

      {/* Course List Display */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9em' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Course</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Credits</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{course.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{course.credits}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{course.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* GPA Result Display */}
      {gpa !== null && ( // Check for null instead of just gpa
        <p style={{ marginTop: '15px', padding: '10px', background: '#e9f7ef', border: '1px solid #28a745', borderRadius: '4px', fontWeight: 'bold' }}>
          Calculated GPA: {gpa}
        </p>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button
          style={{ flexGrow: 1, padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          onClick={calculateGpa}
        >
          Calculate GPA
        </button>
        <button
          style={{ flexGrow: 1, padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          onClick={onHide}
        >
          Close Calculator
        </button>
      </div>

    </div>
  );
}

export default GpaCalculator;
