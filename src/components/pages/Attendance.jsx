import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { attendanceService, studentService, classService } from '@/services';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceGrid, setAttendanceGrid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    buildAttendanceGrid();
  }, [attendance, students, classes, selectedDate, selectedClass, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attendanceResult, studentsResult, classesResult] = await Promise.all([
        attendanceService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      setAttendance(attendanceResult);
setStudents(studentsResult);
      setClasses(classesResult);
      if (classesResult.length > 0 && !selectedClass) {
        setSelectedClass(classesResult[0].Id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load attendance data');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const buildAttendanceGrid = () => {
    if (!selectedClass || !students.length) {
      setAttendanceGrid([]);
      return;
    }

    let filteredStudents = students;
    if (searchQuery.trim()) {
filteredStudents = students.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const grid = filteredStudents.map(student => {
const attendanceRecord = attendance.find(
        record => 
          record.student_id === student.Id && 
          record.class_id === parseInt(selectedClass) && 
          record.date === selectedDate
      );
      
      return {
        student,
        status: attendanceRecord?.status || 'Not Marked',
reason: attendanceRecord?.reason || '',
        recordId: attendanceRecord?.Id
      };
    });

    setAttendanceGrid(grid);
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      const reason = newStatus === 'Absent' ? prompt('Reason for absence (optional):') || '' : '';
      
      const result = await attendanceService.markAttendance(
        studentId, 
        selectedClass, 
        newStatus, 
        reason
      );

      // Update local state
      setAttendance(prev => {
const existingIndex = prev.findIndex(
          record => 
            record.student_id === parseInt(studentId) && 
            record.class_id === parseInt(selectedClass) && 
            record.date === selectedDate
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = result;
          return updated;
        } else {
          return [...prev, result];
        }
      });

      toast.success(`Attendance marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return 'Check';
      case 'Absent': return 'X';
      case 'Late': return 'Clock';
      default: return 'Minus';
    }
  };

  const calculateAttendanceStats = () => {
    if (!attendanceGrid.length) return { present: 0, absent: 0, late: 0, notMarked: 0 };
    
    const stats = attendanceGrid.reduce((acc, item) => {
      const status = item.status.toLowerCase();
      if (status === 'present') acc.present++;
      else if (status === 'absent') acc.absent++;
      else if (status === 'late') acc.late++;
      else acc.notMarked++;
      return acc;
    }, { present: 0, absent: 0, late: 0, notMarked: 0 });

    return stats;
};

  const selectedClassName = classes.find(c => c.Id === parseInt(selectedClass))?.Name || '';
  const stats = calculateAttendanceStats();
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
        </div>
        <SkeletonLoader count={8} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
        </div>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
        </div>
        <EmptyState
          icon="Calendar"
          title="No classes available"
          description="Create classes first to start tracking attendance"
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
          <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
          <p className="text-surface-600">
            Track daily attendance for {selectedClassName}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-surface-700">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-surface-700">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
>
            {classes.map(classItem => (
              <option key={classItem.Id} value={classItem.Id}>
                {classItem.Name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search students..."
            onSearch={setSearchQuery}
            className="w-full"
          />
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-surface-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Check" size={16} className="text-success" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-900">{stats.present}</p>
              <p className="text-sm text-surface-600">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-surface-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="X" size={16} className="text-error" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-900">{stats.absent}</p>
              <p className="text-sm text-surface-600">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-surface-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Clock" size={16} className="text-warning" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-900">{stats.late}</p>
              <p className="text-sm text-surface-600">Late</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-surface-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Minus" size={16} className="text-surface-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-900">{stats.notMarked}</p>
              <p className="text-sm text-surface-600">Not Marked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      {attendanceGrid.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No students found"
          description={searchQuery ? "No students match your search criteria" : "No students enrolled in this class"}
        />
      ) : (
        <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
          <div className="p-4 border-b border-surface-200">
            <h3 className="text-lg font-medium text-surface-900">
              Student Attendance - {new Date(selectedDate).toLocaleDateString()}
            </h3>
          </div>
          <div className="divide-y divide-surface-200">
            {attendanceGrid.map((item, index) => (
              <motion.div
                key={item.student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-surface-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {item.student.first_name[0]}{item.student.last_name[0]}
                      </span>
                    </div>
<div>
                      <p className="font-medium text-surface-900">
                        {item.student.first_name} {item.student.last_name}
                      </p>
                      <p className="text-sm text-surface-500">{item.student.grade}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={getStatusColor(item.status)} 
                      size="small"
                      className="flex items-center"
                    >
                      <ApperIcon 
                        name={getStatusIcon(item.status)} 
                        size={12} 
                        className="mr-1" 
                      />
                      {item.status}
                    </Badge>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="small"
                        variant={item.status === 'Present' ? 'success' : 'outline'}
onClick={() => handleStatusChange(item.student.Id, 'Present')}
                      >
                        <ApperIcon name="Check" size={14} />
                      </Button>
                      <Button
                        size="small"
                        variant={item.status === 'Late' ? 'warning' : 'outline'}
onClick={() => handleStatusChange(item.student.Id, 'Late')}
                      >
                        <ApperIcon name="Clock" size={14} />
                      </Button>
                      <Button
                        size="small"
                        variant={item.status === 'Absent' ? 'danger' : 'outline'}
onClick={() => handleStatusChange(item.student.Id, 'Absent')}
                      >
                        <ApperIcon name="X" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
                {item.reason && (
                  <div className="mt-2 ml-13">
                    <p className="text-sm text-surface-600 italic">Reason: {item.reason}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;