import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import { classService, teacherService } from '@/services';

const ClassForm = ({ classItem = null, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    name: classItem?.Name || '',
    subject: classItem?.subject || '',
    teacherId: classItem?.teacher_id || '',
    grade: classItem?.grade || '',
    schedule: classItem?.schedule || '',
    room: classItem?.room || '',
    capacity: classItem?.capacity || 25
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [errors, setErrors] = useState({});

  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Physical Education', 'Art', 'Music'];
  const grades = ['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const result = await teacherService.getAll();
      setTeachers(result);
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.room.trim()) newErrors.room = 'Room is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      if (classItem) {
        result = await classService.update(classItem.id, formData);
        toast.success('Class updated successfully');
      } else {
        result = await classService.create(formData);
        toast.success('Class created successfully');
      }
      onSubmit(result);
    } catch (error) {
      toast.error(error.message || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' ? parseInt(value) || 0 : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Class Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-surface-700">
            Subject <span className="text-error ml-1">*</span>
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              errors.subject 
                ? 'border-error focus:ring-error focus:border-error' 
                : 'border-surface-300 focus:ring-primary focus:border-primary'
            }`}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          {errors.subject && <p className="text-sm text-error">{errors.subject}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-surface-700">
            Teacher <span className="text-error ml-1">*</span>
          </label>
          <select
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              errors.teacherId 
                ? 'border-error focus:ring-error focus:border-error' 
                : 'border-surface-300 focus:ring-primary focus:border-primary'
            }`}
            required
            disabled={loadingTeachers}
          >
            <option value="">Select Teacher</option>
{teachers.map(teacher => (
              <option key={teacher.Id} value={teacher.Id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
          {errors.teacherId && <p className="text-sm text-error">{errors.teacherId}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-surface-700">
            Grade <span className="text-error ml-1">*</span>
          </label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              errors.grade 
                ? 'border-error focus:ring-error focus:border-error' 
                : 'border-surface-300 focus:ring-primary focus:border-primary'
            }`}
            required
          >
            <option value="">Select Grade</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          {errors.grade && <p className="text-sm text-error">{errors.grade}</p>}
        </div>
      </div>

      <Input
        label="Schedule"
        name="schedule"
        value={formData.schedule}
        onChange={handleChange}
        placeholder="e.g., Mon, Wed, Fri 9:00-9:50 AM"
        error={errors.schedule}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Room"
          name="room"
          value={formData.room}
          onChange={handleChange}
          error={errors.room}
          required
        />
        <Input
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          error={errors.capacity}
          min="1"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : classItem ? 'Update Class' : 'Create Class'}
        </Button>
      </div>
    </form>
  );
};

export default ClassForm;