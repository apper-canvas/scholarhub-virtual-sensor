import { toast } from 'react-toastify';

class GradeService {
  constructor() {
    this.tableName = 'grade';
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
        Fields: ['Name', 'score', 'max_score', 'type', 'date', 'comments', 'student_id', 'class_id']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'score', 'max_score', 'type', 'date', 'comments', 'student_id', 'class_id']
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching grade with ID ${id}:`, error);
      return null;
    }
  }

  async create(grade) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: `${grade.type} - ${grade.score}/${grade.maxScore}`,
          score: parseFloat(grade.score),
          max_score: parseInt(grade.maxScore),
          type: grade.type,
          date: grade.date || new Date().toISOString().split('T')[0],
          comments: grade.comments || '',
          student_id: parseInt(grade.studentId),
          class_id: parseInt(grade.classId)
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
      console.error('Error creating grade:', error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updates.type && updates.score && updates.maxScore ? `${updates.type} - ${updates.score}/${updates.maxScore}` : undefined,
          score: updates.score ? parseFloat(updates.score) : undefined,
          max_score: updates.maxScore ? parseInt(updates.maxScore) : undefined,
          type: updates.type,
          date: updates.date,
          comments: updates.comments,
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
      console.error('Error updating grade:', error);
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
      console.error('Error deleting grade:', error);
      throw error;
    }
  }

  async getByStudent(studentId) {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'score', 'max_score', 'type', 'date', 'comments', 'student_id', 'class_id'],
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
      console.error('Error fetching grades by student:', error);
      throw error;
    }
  }

  async getByClass(classId) {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'score', 'max_score', 'type', 'date', 'comments', 'student_id', 'class_id'],
        where: [
          {
            FieldName: 'class_id',
            Operator: 'EqualTo',
            Values: [parseInt(classId)]
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
      console.error('Error fetching grades by class:', error);
      throw error;
    }
  }
}

export default new GradeService();