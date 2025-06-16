import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import DataTable from '@/components/molecules/DataTable';
import Modal from '@/components/molecules/Modal';
import StudentForm from '@/components/organisms/StudentForm';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { studentService } from '@/services';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.getAll();
      setStudents(result);
    } catch (err) {
      setError(err.message || 'Failed to load students');
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDelete = async (student) => {
    if (!confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      return;
    }

    try {
      await studentService.delete(student.id);
      setStudents(prev => prev.filter(s => s.id !== student.id));
      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleFormSubmit = (savedStudent) => {
    if (selectedStudent) {
      setStudents(prev => prev.map(s => s.id === savedStudent.id ? savedStudent : s));
    } else {
      setStudents(prev => [...prev, savedStudent]);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (_, student) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary">
              {student.firstName[0]}{student.lastName[0]}
            </span>
          </div>
          <div>
            <div className="font-medium text-surface-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-surface-500">{student.contactEmail}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (grade) => (
        <Badge variant="info" size="small">{grade}</Badge>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => (
        <Badge 
          variant={status === 'Active' ? 'success' : 'default'} 
          size="small"
        >
          {status}
        </Badge>
      )
    },
    {
      header: 'Contact Phone',
      accessor: 'contactPhone'
    },
    {
      header: 'Enrollment Date',
      accessor: 'enrollmentDate',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Students</h1>
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
          <h1 className="text-2xl font-bold text-surface-900">Students</h1>
          <Button onClick={() => setShowModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Student
          </Button>
        </div>
        <ErrorState message={error} onRetry={loadStudents} />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Students</h1>
          <Button onClick={() => setShowModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Student
          </Button>
        </div>
        <EmptyState
          icon="Users"
          title="No students found"
          description="Get started by adding your first student to the system"
          actionLabel="Add Student"
          onAction={() => setShowModal(true)}
        />
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedStudent ? 'Edit Student' : 'Add New Student'}
          size="large"
        >
          <StudentForm
            student={selectedStudent}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
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
          <h1 className="text-2xl font-bold text-surface-900">Students</h1>
          <p className="text-surface-600">
            Manage student profiles and enrollment information
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Student
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          placeholder="Search students by name, grade, or email..."
          onSearch={setSearchQuery}
          className="flex-1"
        />
        <div className="flex items-center text-sm text-surface-600">
          <ApperIcon name="Users" size={16} className="mr-2" />
          {filteredStudents.length} students
        </div>
      </div>

      <DataTable
        data={filteredStudents}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedStudent ? 'Edit Student' : 'Add New Student'}
        size="large"
      >
        <StudentForm
          student={selectedStudent}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Students;