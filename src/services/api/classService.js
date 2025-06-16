import { toast } from 'react-toastify';

class ClassService {
  constructor() {
    this.tableName = 'class';
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
        Fields: ['Name', 'subject', 'grade', 'schedule', 'room', 'capacity', 'enrolled_count', 'teacher_id']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'subject', 'grade', 'schedule', 'room', 'capacity', 'enrolled_count', 'teacher_id']
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching class with ID ${id}:`, error);
      return null;
    }
  }

  async create(classItem) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: classItem.name,
          subject: classItem.subject,
          grade: classItem.grade,
          schedule: classItem.schedule || '',
          room: classItem.room,
          capacity: parseInt(classItem.capacity) || 25,
          enrolled_count: 0,
          teacher_id: parseInt(classItem.teacherId)
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
      console.error('Error creating class:', error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updates.name,
          subject: updates.subject,
          grade: updates.grade,
          schedule: updates.schedule,
          room: updates.room,
          capacity: updates.capacity ? parseInt(updates.capacity) : undefined,
          enrolled_count: updates.enrolledCount ? parseInt(updates.enrolledCount) : undefined,
          teacher_id: updates.teacherId ? parseInt(updates.teacherId) : undefined
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
      console.error('Error updating class:', error);
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
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  async getByTeacher(teacherId) {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'subject', 'grade', 'schedule', 'room', 'capacity', 'enrolled_count', 'teacher_id'],
        where: [
          {
            FieldName: 'teacher_id',
            Operator: 'EqualTo',
            Values: [parseInt(teacherId)]
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
      console.error('Error fetching classes by teacher:', error);
      throw error;
    }
  }
}

export default new ClassService();