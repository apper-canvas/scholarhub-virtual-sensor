import { useState } from 'react';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import { studentService } from '@/services';

const StudentForm = ({ student = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    dateOfBirth: student?.dateOfBirth || '',
    grade: student?.grade || '',
    contactEmail: student?.contactEmail || '',
    contactPhone: student?.contactPhone || '',
    address: student?.address || '',
    status: student?.status || 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const grades = ['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      if (student) {
        result = await studentService.update(student.id, formData);
        toast.success('Student updated successfully');
      } else {
        result = await studentService.create(formData);
        toast.success('Student created successfully');
      }
      onSubmit(result);
    } catch (error) {
      toast.error(error.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          required
        />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Contact Email"
          name="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={handleChange}
          error={errors.contactEmail}
          required
        />
        <Input
          label="Contact Phone"
          name="contactPhone"
          type="tel"
          value={formData.contactPhone}
          onChange={handleChange}
          error={errors.contactPhone}
        />
      </div>

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-surface-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
          <option value="Transferred">Transferred</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;