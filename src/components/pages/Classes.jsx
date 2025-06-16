import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SearchBar from "@/components/molecules/SearchBar";
import DataTable from "@/components/molecules/DataTable";
import Modal from "@/components/molecules/Modal";
import ClassForm from "@/components/organisms/ClassForm";
import SkeletonLoader from "@/components/atoms/SkeletonLoader";
import ErrorState from "@/components/molecules/ErrorState";
import EmptyState from "@/components/molecules/EmptyState";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { classService, teacherService } from "@/services";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [classesResult, teachersResult] = await Promise.all([
        classService.getAll(),
        teacherService.getAll()
      ]);
      setClasses(classesResult);
      setTeachers(teachersResult);
    } catch (err) {
      setError(err.message || 'Failed to load classes');
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    if (!searchQuery.trim()) {
      setFilteredClasses(classes);
      return;
    }

    const filtered = classes.filter(classItem => 
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.room.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.Id === parseInt(teacherId));
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
  };

  const handleEdit = (classItem) => {
    setSelectedClass(classItem);
    setShowModal(true);
  };

  const handleDelete = async (classItem) => {
    if (!confirm(`Are you sure you want to delete the class "${classItem.name}"?`)) {
      return;
    }

    try {
      await classService.delete(classItem.id);
      setClasses(prev => prev.filter(c => c.id !== classItem.id));
      toast.success('Class deleted successfully');
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const handleFormSubmit = (savedClass) => {
    if (selectedClass) {
      setClasses(prev => prev.map(c => c.id === savedClass.id ? savedClass : c));
    } else {
      setClasses(prev => [...prev, savedClass]);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  const columns = [
    {
      header: 'Class',
      accessor: 'name',
      render: (_, classItem) => (
        <div>
          <div className="font-medium text-surface-900">{classItem.name}</div>
          <div className="text-sm text-surface-500">{classItem.subject}</div>
        </div>
      )
    },
    {
      header: 'Teacher',
accessor: 'teacher_id',
      render: (teacherId) => (
        <div className="text-sm text-surface-900">
          {getTeacherName(teacherId)}
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
      header: 'Room',
      accessor: 'room'
    },
{
      header: 'Capacity',
      accessor: 'capacity',
      render: (capacity, classItem) => (
        <div className="text-sm">
          <span className="font-medium">{classItem.enrolled_count}</span>
          <span className="text-surface-500"> / {capacity}</span>
          <div className="w-full bg-surface-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${(classItem.enrolled_count / capacity) * 100}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      header: 'Schedule',
      accessor: 'schedule',
      render: (schedule) => (
        <div className="text-xs text-surface-600 max-w-32 break-words">
          {schedule}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Classes</h1>
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
          <h1 className="text-2xl font-bold text-surface-900">Classes</h1>
          <Button onClick={() => setShowModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Class
          </Button>
        </div>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Classes</h1>
          <Button onClick={() => setShowModal(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Class
          </Button>
        </div>
        <EmptyState
          icon="BookOpen"
          title="No classes found"
          description="Create your first class to start organizing your curriculum"
          actionLabel="Add Class"
          onAction={() => setShowModal(true)}
        />
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedClass ? 'Edit Class' : 'Add New Class'}
          size="large"
        >
          <ClassForm
            classItem={selectedClass}
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
          <h1 className="text-2xl font-bold text-surface-900">Classes</h1>
          <p className="text-surface-600">
            Manage class schedules, teachers, and enrollment
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Class
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          placeholder="Search classes by name, subject, teacher, or room..."
          onSearch={setSearchQuery}
          className="flex-1"
        />
        <div className="flex items-center text-sm text-surface-600">
          <ApperIcon name="BookOpen" size={16} className="mr-2" />
          {filteredClasses.length} classes
        </div>
      </div>

      <DataTable
        data={filteredClasses}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedClass ? 'Edit Class' : 'Add New Class'}
        size="large"
      >
        <ClassForm
          classItem={selectedClass}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Classes;