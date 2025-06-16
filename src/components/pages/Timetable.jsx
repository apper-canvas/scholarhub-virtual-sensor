import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import DataTable from '@/components/molecules/DataTable';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import timetableService from '@/services/api/timetableService';
import { teacherService, studentService } from '@/services';

const Timetable = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'teacher', 'student', 'conflicts'
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [schedules, searchQuery, filterType, selectedTeacher, selectedStudent]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [timetableData, teachersData, studentsData] = await Promise.all([
        timetableService.getAll(),
        teacherService.getAll(),
        studentService.getAll()
      ]);
      setSchedules(timetableData.schedules);
      setConflicts(timetableData.conflicts);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message || 'Failed to load timetable data');
      toast.error('Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  const filterSchedules = () => {
    let filtered = [...schedules];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(schedule => 
        schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.grade.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'teacher':
        if (selectedTeacher) {
          filtered = filtered.filter(schedule => schedule.teacherId === selectedTeacher);
        }
        break;
      case 'student':
        // In a real implementation, this would filter by student enrollments
        // For now, show all schedules as students could be in any class
        break;
      case 'conflicts':
        filtered = filtered.filter(schedule => schedule.hasConflict);
        break;
      default:
        break;
    }

    setFilteredSchedules(filtered);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setSelectedTeacher('');
    setSelectedStudent('');
  };

  const columns = [
    {
      header: 'Class',
      accessor: 'name',
      render: (_, schedule) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <ApperIcon 
              name={schedule.hasConflict ? 'AlertTriangle' : 'BookOpen'} 
              size={16} 
              className={schedule.hasConflict ? 'text-red-600' : 'text-primary'}
            />
          </div>
          <div>
            <div className="font-medium text-surface-900">{schedule.name}</div>
            <div className="text-sm text-surface-500">{schedule.subject}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Teacher',
      accessor: 'teacherName',
      render: (teacherName, schedule) => (
        <div>
          <div className="font-medium text-surface-900">{teacherName}</div>
          <div className="text-sm text-surface-500">{schedule.teacherEmail}</div>
        </div>
      )
    },
    {
      header: 'Schedule',
      accessor: 'schedule',
      render: (schedule, item) => (
        <div>
          <div className="font-medium text-surface-900">
            {item.parsedSchedule.days.join(', ')}
          </div>
          <div className="text-sm text-surface-500">{item.parsedSchedule.timeSlot}</div>
        </div>
      )
    },
    {
      header: 'Room',
      accessor: 'room',
      render: (room) => (
        <Badge variant="outline" size="small">{room}</Badge>
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
      header: 'Enrollment',
      accessor: 'enrollment',
      render: (_, schedule) => (
        <div className="text-sm">
          <span className="font-medium">{schedule.enrolledCount}</span>
          <span className="text-surface-500">/{schedule.capacity}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (_, schedule) => (
        <Badge 
          variant={schedule.hasConflict ? 'danger' : 'success'} 
          size="small"
        >
          {schedule.hasConflict ? 'Conflict' : 'No Conflict'}
        </Badge>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Timetable</h1>
        </div>
        <SkeletonLoader count={6} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Timetable</h1>
        </div>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Timetable</h1>
        </div>
        <EmptyState
          icon="Calendar"
          title="No schedule data found"
          description="Class schedules will appear here once classes are configured with time slots"
        />
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
          <h1 className="text-2xl font-bold text-surface-900">Timetable</h1>
          <p className="text-surface-600">
            View class schedules and identify potential conflicts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={conflicts.length > 0 ? 'danger' : 'success'} size="small">
            {conflicts.length} Conflicts
          </Badge>
        </div>
      </motion.div>

      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <SearchBar
          placeholder="Search by class, teacher, subject, or room..."
          onSearch={setSearchQuery}
          className="flex-1"
        />
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === 'all' ? 'primary' : 'outline'}
            size="small"
            onClick={() => handleFilterChange('all')}
          >
            All Classes
          </Button>
          <Button
            variant={filterType === 'conflicts' ? 'primary' : 'outline'}
            size="small"
            onClick={() => handleFilterChange('conflicts')}
          >
            <ApperIcon name="AlertTriangle" size={14} className="mr-1" />
            Conflicts Only
          </Button>
          <Button
            variant={filterType === 'teacher' ? 'primary' : 'outline'}
            size="small"
            onClick={() => handleFilterChange('teacher')}
          >
            By Teacher
          </Button>
        </div>
      </div>

      {/* Teacher Filter Dropdown */}
      {filterType === 'teacher' && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-surface-700">Select Teacher:</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-surface-200">
          <div className="text-2xl font-bold text-surface-900">{schedules.length}</div>
          <div className="text-sm text-surface-600">Total Classes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-surface-200">
          <div className="text-2xl font-bold text-surface-900">{teachers.length}</div>
          <div className="text-sm text-surface-600">Teachers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-surface-200">
          <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
          <div className="text-sm text-surface-600">Conflicts</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-surface-200">
          <div className="text-2xl font-bold text-surface-900">{filteredSchedules.length}</div>
          <div className="text-sm text-surface-600">Showing</div>
        </div>
      </div>

      <DataTable
        data={filteredSchedules}
        columns={columns}
      />

      {/* Conflicts Summary */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <ApperIcon name="AlertTriangle" size={20} className="mr-2" />
            Schedule Conflicts Detected
          </h3>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-red-700">
                <strong>{conflict.class1.name}</strong> and <strong>{conflict.class2.name}</strong>
                <span className="text-red-600"> overlap on </span>
                <strong>{conflict.overlappingDays.join(', ')}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;