// frontend/src/components/GpaCalculator.jsx
import React, { useState } from 'react';

function GpaCalculator({ onHide }) {
  // State management
  const [courses, setCourses] = useState([{ grade: 'A', credits: 3, id: 1 }]);
  const [gpaResult, setGpaResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nigerian 5.00 Scale Grade Points
  const gradePoints = {
    'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0
  };
  
  // Grade options (no A+/A-)
  const gradeOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Add new course
  const addCourse = () => {
    setCourses([...courses, { grade: 'A', credits: 3, id: Date.now() }]);
  };

  // Remove course
  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  // Update course field
  const updateCourse = (id, field, value) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  // Calculate GPA by calling backend
  const calculateGPA = async () => {
    setLoading(true);
    setError('');
    setGpaResult(null);
    
    try {
      // Prepare data for backend
      const grades = courses.map(c => c.grade);
      const credits = courses.map(c => parseFloat(c.credits) || 0);
      
      // Validate inputs
      for (let i = 0; i < credits.length; i++) {
        if (!credits[i] || credits[i] <= 0) {
          setError(`Course ${i + 1}: Enter valid credit hours (1-10)`);
          setLoading(false);
          return;
        }
      }
      
      // Call backend API
      const response = await fetch('http://localhost:8000/api/calculate-gpa/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grades, credits }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGpaResult(data);
      } else {
        setError(data.error || 'Failed to calculate GPA');
      }
    } catch (err) {
      setError('Error: Backend server not responding. Make sure Django is running on port 8000.');
      console.error('GPA calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset calculator
  const resetCalculator = () => {
    setCourses([{ grade: 'A', credits: 3, id: 1 }]);
    setGpaResult(null);
    setError('');
  };

  // Get Nigerian classification
  const getClassificationInfo = (gpa) => {
    if (gpa >= 4.50) return {
      text: 'First Class Honours 🥇',
      color: '#28a745',
      description: 'Excellent! Outstanding achievement'
    };
    if (gpa >= 3.50) return {
      text: 'Second Class Upper (2:1) 🥈',
      color: '#17a2b8',
      description: 'Very good performance'
    };
    if (gpa >= 2.50) return {
      text: 'Second Class Lower (2:2) 🥉',
      color: '#ffc107',
      description: 'Good performance'
    };
    if (gpa >= 1.50) return {
      text: 'Third Class 📖',
      color: '#fd7e14',
      description: 'Satisfactory performance'
    };
    if (gpa >= 1.00) return {
      text: 'Pass Degree 🎯',
      color: '#dc3545',
      description: 'Minimum passing grade'
    };
    return {
      text: 'Fail ❌',
      color: '#721c24',
      description: 'Below minimum requirements'
    };
  };

  // Calculate total quality points (frontend fallback)
  const calculateTotalPoints = () => {
    return courses.reduce((total, course) => {
      const points = gradePoints[course.grade] || 0;
      const credits = parseFloat(course.credits) || 0;
      return total + (points * credits);
    }, 0);
  };

  // Calculate total credits
  const calculateTotalCredits = () => {
    return courses.reduce((total, course) => {
      return total + (parseFloat(course.credits) || 0);
    }, 0);
  };

  return (
    <div style={{ padding: '15px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#0056b3' }}>📊 GPA Calculator</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
            Nigerian 5.00 Scale: A=5, B=4, C=3, D=2, E=1, F=0
          </p>
        </div>
        <button 
          onClick={onHide}
          style={{ 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '8px 15px',
            cursor: 'pointer',
            fontSize: '0.9em'
          }}
        >
          Close Calculator
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '5px', 
          marginBottom: '15px',
          border: '1px solid #f5c6cb',
          fontSize: '0.9em'
        }}>
          ⚠️ <strong>Error:</strong> {error}
        </div>
      )}

      {/* Course Input Section */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px' 
        }}>
          <div>
            <strong style={{ fontSize: '1.1em' }}>Course Details</strong>
            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
              {courses.length} course(s) • {calculateTotalCredits()} total units
            </div>
          </div>
          <button 
            onClick={addCourse}
            style={{ 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '8px 15px',
              cursor: 'pointer',
              fontSize: '0.9em',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>+</span> Add Course
          </button>
        </div>
        
        {/* Course Inputs */}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {courses.map((course, index) => (
            <div key={course.id} style={{ 
              display: 'grid',
              gridTemplateColumns: 'auto 100px 100px auto 80px',
              gap: '10px',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '10px',
              background: index % 2 === 0 ? '#f8f9fa' : '#fff',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              {/* Course Number */}
              <div style={{ minWidth: '70px', fontWeight: '500' }}>
                Course {index + 1}
              </div>
              
              {/* Grade Select */}
              <select
                value={course.grade}
                onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                style={{ 
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>
                    {grade} ({gradePoints[grade]} points)
                  </option>
                ))}
              </select>
              
              {/* Credit Hours Input */}
              <input
                type="number"
                value={course.credits}
                onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                min="1"
                max="10"
                step="1"
                placeholder="Units"
                style={{ 
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
              
              {/* Points Display */}
              <div style={{ 
                fontSize: '0.9em', 
                color: '#495057',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: '500' }}>Points</div>
                <div>{(gradePoints[course.grade] * (parseFloat(course.credits) || 0)).toFixed(1)}</div>
              </div>
              
              {/* Remove Button */}
              <button 
                onClick={() => removeCourse(course.id)}
                disabled={courses.length <= 1}
                style={{ 
                  background: courses.length > 1 ? '#dc3545' : '#adb5bd',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '8px 12px',
                  cursor: courses.length > 1 ? 'pointer' : 'not-allowed',
                  fontSize: '0.85em',
                  whiteSpace: 'nowrap'
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={calculateGPA}
          disabled={loading}
          style={{ 
            flex: 2,
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            padding: '14px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              Calculating...
            </>
          ) : (
            '📊 Calculate GPA'
          )}
        </button>
        
        <button
          onClick={resetCalculator}
          style={{ 
            flex: 1,
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            padding: '14px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Results Section */}
      {gpaResult && (
        <div style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
          borderRadius: '10px',
          border: '2px solid #007bff',
          marginTop: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#0056b3' }}>GPA Result</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>
              5.00 Scale | {courses.length} Course{courses.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* GPA Display */}
          <div style={{ 
            textAlign: 'center',
            margin: '25px 0'
          }}>
            <div style={{ 
              fontSize: '3.5rem', 
              fontWeight: 'bold', 
              color: '#0056b3',
              lineHeight: '1',
              marginBottom: '10px'
            }}>
              {gpaResult.gpa.toFixed(2)}
              <span style={{ 
                fontSize: '1.5rem', 
                color: '#666',
                fontWeight: 'normal',
                marginLeft: '5px'
              }}>
                /5.00
              </span>
            </div>
            
            {/* Classification */}
            {(() => {
              const classification = getClassificationInfo(gpaResult.gpa);
              return (
                <div style={{ 
                  padding: '12px 20px',
                  background: classification.color,
                  color: 'white',
                  borderRadius: '8px',
                  margin: '15px 0',
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  display: 'inline-block'
                }}>
                  {classification.text}
                </div>
              );
            })()}
            
            <p style={{ 
              margin: '10px 0 0 0', 
              color: '#666', 
              fontSize: '0.9em',
              fontStyle: 'italic'
            }}>
              {getClassificationInfo(gpaResult.gpa).description}
            </p>
          </div>
          
          {/* Statistics Grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginTop: '25px'
          }}>
            <div style={{ 
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                Total Courses
              </div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#007bff' }}>
                {gpaResult.grades_count}
              </div>
            </div>
            
            <div style={{ 
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                Total Units
              </div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#17a2b8' }}>
                {gpaResult.total_credits}
              </div>
            </div>
            
            <div style={{ 
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                Quality Points
              </div>
              <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#28a745' }}>
                {gpaResult.total_points.toFixed(1)}
              </div>
            </div>
          </div>
          
          {/* Course Breakdown */}
          <div style={{ 
            marginTop: '25px',
            padding: '15px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>📋 Course Breakdown</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Course</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Grade</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Units</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Points</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, idx) => {
                    const points = gradePoints[course.grade] || 0;
                    const credits = parseFloat(course.credits) || 0;
                    const score = points * credits;
                    
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '10px' }}>Course {idx + 1}</td>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{course.grade}</td>
                        <td style={{ padding: '10px' }}>{credits}</td>
                        <td style={{ padding: '10px' }}>{points.toFixed(1)}</td>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{score.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Nigerian Classification Guide */}
      <div style={{ 
        marginTop: '25px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '10px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#212529' }}>🇳🇬 Nigerian Classification System</h4>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <div style={{ background: '#28a745', color: 'white', padding: '10px', borderRadius: '5px' }}>
            <strong>4.50 - 5.00</strong><br />First Class 🥇
          </div>
          <div style={{ background: '#17a2b8', color: 'white', padding: '10px', borderRadius: '5px' }}>
            <strong>3.50 - 4.49</strong><br />2nd Class Upper 🥈
          </div>
          <div style={{ background: '#ffc107', color: '#212529', padding: '10px', borderRadius: '5px' }}>
            <strong>2.50 - 3.49</strong><br />2nd Class Lower 🥉
          </div>
          <div style={{ background: '#fd7e14', color: 'white', padding: '10px', borderRadius: '5px' }}>
            <strong>1.50 - 2.49</strong><br />Third Class 📖
          </div>
          <div style={{ background: '#dc3545', color: 'white', padding: '10px', borderRadius: '5px' }}>
            <strong>1.00 - 1.49</strong><br />Pass 🎯
          </div>
          <div style={{ background: '#721c24', color: 'white', padding: '10px', borderRadius: '5px' }}>
            <strong>Below 1.00</strong><br />Fail ❌
          </div>
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          background: '#e7f3ff', 
          borderRadius: '5px',
          borderLeft: '4px solid #007bff',
          fontSize: '0.9em'
        }}>
          <strong>💡 Pro Tip:</strong> You can also ask in the chat: "Calculate my GPA: A=5, B=4, C=3" 
          and I'll calculate it for you instantly!
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GpaCalculator;
