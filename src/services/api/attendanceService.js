import { toast } from 'react-toastify';

class AttendanceService {
  constructor() {
    this.tableName = 'attendance';
    this.apperClient = null;
  }

  getApperClient() {
    if (!this.apperClient) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    return this.apperClient;
  }

  async getAll() {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'date', 'status', 'reason', 'student_id', 'class_id']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'date', 'status', 'reason', 'student_id', 'class_id']
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance with ID ${id}:`, error);
      return null;
    }
  }

  async create(attendance) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: `${attendance.status} - ${attendance.date}`,
          date: attendance.date || new Date().toISOString().split('T')[0],
          status: attendance.status,
          reason: attendance.reason || '',
          student_id: parseInt(attendance.studentId),
          class_id: parseInt(attendance.classId)
        }]
      };
      
      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updates.status && updates.date ? `${updates.status} - ${updates.date}` : undefined,
          date: updates.date,
          status: updates.status,
          reason: updates.reason,
          student_id: updates.studentId ? parseInt(updates.studentId) : undefined,
          class_id: updates.classId ? parseInt(updates.classId) : undefined
        }]
      };
      
      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const client = this.getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await client.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  }

  async getByStudent(studentId) {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'date', 'status', 'reason', 'student_id', 'class_id'],
        where: [
          {
            FieldName: 'student_id',
            Operator: 'EqualTo',
            Values: [parseInt(studentId)]
          }
        ]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching attendance by student:', error);
      throw error;
    }
  }

  async getByDate(date) {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'date', 'status', 'reason', 'student_id', 'class_id'],
        where: [
          {
            FieldName: 'date',
            Operator: 'EqualTo',
            Values: [date]
          }
        ]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      throw error;
    }
  }

  async markAttendance(studentId, classId, status, reason = '') {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if attendance already exists for today
      const existingAttendance = await this.getByDate(today);
      const existing = existingAttendance.find(
        record => record.student_id === parseInt(studentId) && 
        record.class_id === parseInt(classId)
      );

      if (existing) {
        return this.update(existing.Id, { status, reason });
      } else {
        return this.create({ 
          studentId: parseInt(studentId), 
          classId: parseInt(classId), 
          status, 
          reason,
          date: today
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }
}

export default new AttendanceService();