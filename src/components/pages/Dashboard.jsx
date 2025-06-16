import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MetricCard from '@/components/molecules/MetricCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import { studentService, classService, attendanceService, gradeService } from '@/services';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [students, classes, attendance, grades] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        attendanceService.getAll(),
        gradeService.getAll()
      ]);

      // Calculate metrics
      const totalStudents = students.length;
      const totalClasses = classes.length;
      
      // Calculate attendance rate
      const presentCount = attendance.filter(record => record.status === 'Present').length;
      const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
      
      // Calculate average grade
      const totalScore = grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore * 100), 0);
      const averageGrade = grades.length > 0 ? Math.round(totalScore / grades.length) : 0;

      setMetrics({
        totalStudents,
        totalClasses,
        attendanceRate,
        averageGrade
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Dashboard</h1>
          <p className="text-surface-600">Welcome to ScholarHub - Your school management overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="metric" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Dashboard</h1>
          <p className="text-surface-600">Welcome to ScholarHub - Your school management overview</p>
        </div>
        <ErrorState message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-surface-200 pb-4"
      >
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Dashboard</h1>
        <p className="text-surface-600">Welcome to ScholarHub - Your school management overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={metrics.totalStudents || 0}
          icon="Users"
          color="primary"
          change="+12 this month"
          trend="up"
        />
        <MetricCard
          title="Total Classes"
          value={metrics.totalClasses || 0}
          icon="BookOpen"
          color="secondary"
          change="2 new classes"
          trend="up"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${metrics.attendanceRate || 0}%`}
          icon="Calendar"
          color="success"
          change="+2% from last week"
          trend="up"
        />
        <MetricCard
          title="Average Grade"
          value={`${metrics.averageGrade || 0}%`}
          icon="TrendingUp"
          color="warning"
          change="+1.5% improvement"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">New student enrolled</p>
                <p className="text-xs text-surface-500">Emma Johnson joined 8th Grade - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Attendance marked</p>
                <p className="text-xs text-surface-500">All classes attendance updated - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Grade entered</p>
                <p className="text-xs text-surface-500">Biology test scores updated - 6 hours ago</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
        >
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-2">
                <span className="text-white text-lg">+</span>
              </div>
              <span className="text-sm font-medium text-surface-900">Add Student</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-secondary/5 hover:bg-secondary/10 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-2">
                <span className="text-white text-lg">+</span>
              </div>
              <span className="text-sm font-medium text-surface-900">New Class</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-success/5 hover:bg-success/10 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center mb-2">
                <span className="text-white text-lg">✓</span>
              </div>
              <span className="text-sm font-medium text-surface-900">Mark Attendance</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-warning/5 hover:bg-warning/10 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center mb-2">
                <span className="text-white text-lg">📊</span>
              </div>
              <span className="text-sm font-medium text-surface-900">Enter Grades</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;