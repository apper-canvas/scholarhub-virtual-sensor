import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import DataTable from '@/components/molecules/DataTable';
import Modal from '@/components/molecules/Modal';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { gradeService, studentService, classService } from '@/services';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    score: '',
    maxScore: 100,
    type: 'Test',
    comments: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const gradeTypes = ['Test', 'Quiz', 'Homework', 'Project', 'Essay', 'Midterm', 'Final'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterGrades();
  }, [grades, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gradesResult, studentsResult, classesResult] = await Promise.all([
        gradeService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      setGrades(gradesResult);
      setStudents(studentsResult);
      setClasses(classesResult);
    } catch (err) {
      setError(err.message || 'Failed to load grades');
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = () => {
    if (!searchQuery.trim()) {
      setFilteredGrades(grades);
      return;
    }

    const filtered = grades.filter(grade => {
      const student = getStudentName(grade.studentId);
      const className = getClassName(grade.classId);
      return (
        student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredGrades(filtered);
  };

const getStudentName = (studentId) => {
    const student = students.find(s => s.Id === parseInt(studentId));
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

const getClassName = (classId) => {
    const classItem = classes.find(c => c.Id === parseInt(classId));
    return classItem ? classItem.Name : 'Unknown Class';
  };

  const calculatePercentage = (score, maxScore) => {
    return Math.round((score / maxScore) * 100);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

const handleEdit = (grade) => {
    setSelectedGrade(grade);
    setFormData({
      studentId: grade.student_id,
      classId: grade.class_id,
      score: grade.score.toString(),
      maxScore: grade.max_score,
      type: grade.type,
      comments: grade.comments || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (grade) => {
const studentName = getStudentName(grade.student_id);
    const className = getClassName(grade.class_id);
    
    if (!confirm(`Are you sure you want to delete the ${grade.type} grade for ${studentName} in ${className}?`)) {
      return;
    }

    try {
      await gradeService.delete(grade.id);
      setGrades(prev => prev.filter(g => g.id !== grade.id));
      toast.success('Grade deleted successfully');
    } catch (error) {
      toast.error('Failed to delete grade');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.studentId) errors.studentId = 'Student is required';
    if (!formData.classId) errors.classId = 'Class is required';
    if (!formData.score || formData.score < 0) errors.score = 'Valid score is required';
    if (!formData.maxScore || formData.maxScore <= 0) errors.maxScore = 'Max score must be greater than 0';
    if (parseFloat(formData.score) > formData.maxScore) errors.score = 'Score cannot exceed max score';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const gradeData = {
        ...formData,
        score: parseFloat(formData.score),
        maxScore: parseInt(formData.maxScore)
      };

      let result;
      if (selectedGrade) {
        result = await gradeService.update(selectedGrade.id, gradeData);
        setGrades(prev => prev.map(g => g.id === result.id ? result : g));
        toast.success('Grade updated successfully');
      } else {
        result = await gradeService.create(gradeData);
        setGrades(prev => [...prev, result]);
        toast.success('Grade created successfully');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGrade(null);
    setFormData({
      studentId: '',
      classId: '',
      score: '',
      maxScore: 100,
      type: 'Test',
      comments: ''
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

const columns = [
    {
      header: 'Student',
      accessor: 'student_id',
      render: (studentId) => (
        <div className="font-medium text-surface-900">
          {getStudentName(studentId)}
        </div>
      )
    },
    {
header: 'Class',
      accessor: 'class_id',
      render: (classId) => (
        <div className="text-sm text-surface-700">
          {getClassName(classId)}
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (type) => (
        <Badge variant="secondary" size="small">{type}</Badge>
      )
    },
    {
      header: 'Score',
      accessor: 'score',
      render: (score, grade) => (
        <div className="text-sm">
<span className="font-medium">{score}</span>
          <span className="text-surface-500"> / {grade.max_score}</span>
        </div>
      )
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
render: (_, grade) => {
        const percentage = calculatePercentage(grade.score, grade.max_score);
        return (
          <Badge variant={getGradeColor(percentage)} size="small">
            {percentage}%
          </Badge>
        );
      }
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Grades</h1>
          <div className="w-32 h-10 bg-surface-200 rounded animate-pulse"></div>
        </div>
        <SkeletonLoader count={5} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Grades</h1>
          <Button onClick={() => setShowModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Grade
          </Button>
        </div>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Grades</h1>
          <Button onClick={() => setShowModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Grade
          </Button>
        </div>
        <EmptyState
          icon="ClipboardList"
          title="No grades recorded"
          description="Start recording student grades and track academic progress"
          actionLabel="Add Grade"
          onAction={() => setShowModal(true)}
        />
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedGrade ? 'Edit Grade' : 'Add New Grade'}
          size="medium"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-surface-700">
                  Student <span className="text-error ml-1">*</span>
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    formErrors.studentId 
                      ? 'border-error focus:ring-error focus:border-error' 
                      : 'border-surface-300 focus:ring-primary focus:border-primary'
                  }`}
                  required
                >
<option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.Id} value={student.Id}>
                    {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
                {formErrors.studentId && <p className="text-sm text-error">{formErrors.studentId}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-surface-700">
                  Class <span className="text-error ml-1">*</span>
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    formErrors.classId 
                      ? 'border-error focus:ring-error focus:border-error' 
                      : 'border-surface-300 focus:ring-primary focus:border-primary'
                  }`}
                  required
                >
<option value="">Select Class</option>
                {classes.map(classItem => (
                  <option key={classItem.Id} value={classItem.Id}>
                    {classItem.Name}
                    </option>
                  ))}
                </select>
                {formErrors.classId && <p className="text-sm text-error">{formErrors.classId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Score"
                name="score"
                type="number"
                value={formData.score}
                onChange={handleFormChange}
                error={formErrors.score}
                min="0"
                step="0.5"
                required
              />
              <Input
                label="Max Score"
                name="maxScore"
                type="number"
                value={formData.maxScore}
                onChange={handleFormChange}
                error={formErrors.maxScore}
                min="1"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-surface-700">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {gradeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-surface-700">Comments</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Optional comments about the grade..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : selectedGrade ? 'Update Grade' : 'Add Grade'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Grades</h1>
          <p className="text-surface-600">
            Record and manage student grades across all classes
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Grade
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          placeholder="Search grades by student, class, or type..."
          onSearch={setSearchQuery}
          className="flex-1"
        />
        <div className="flex items-center text-sm text-surface-600">
          <ApperIcon name="ClipboardList" size={16} className="mr-2" />
          {filteredGrades.length} grades
        </div>
      </div>

      <DataTable
        data={filteredGrades}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedGrade ? 'Edit Grade' : 'Add New Grade'}
        size="medium"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-surface-700">
                Student <span className="text-error ml-1">*</span>
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleFormChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  formErrors.studentId 
                    ? 'border-error focus:ring-error focus:border-error' 
                    : 'border-surface-300 focus:ring-primary focus:border-primary'
                }`}
                required
              >
<option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.Id} value={student.Id}>
                    {student.first_name} {student.last_name}
                  </option>
                ))}
              </select>
              {formErrors.studentId && <p className="text-sm text-error">{formErrors.studentId}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-surface-700">
                Class <span className="text-error ml-1">*</span>
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleFormChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  formErrors.classId 
                    ? 'border-error focus:ring-error focus:border-error' 
                    : 'border-surface-300 focus:ring-primary focus:border-primary'
                }`}
                required
              >
<option value="">Select Class</option>
                {classes.map(classItem => (
                  <option key={classItem.Id} value={classItem.Id}>
                    {classItem.Name}
                  </option>
                ))}
              </select>
              {formErrors.classId && <p className="text-sm text-error">{formErrors.classId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Score"
              name="score"
              type="number"
              value={formData.score}
              onChange={handleFormChange}
              error={formErrors.score}
              min="0"
              step="0.5"
              required
            />
            <Input
              label="Max Score"
              name="maxScore"
              type="number"
              value={formData.maxScore}
              onChange={handleFormChange}
              error={formErrors.maxScore}
              min="1"
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-surface-700">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {gradeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Optional comments about the grade..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : selectedGrade ? 'Update Grade' : 'Add Grade'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Grades;