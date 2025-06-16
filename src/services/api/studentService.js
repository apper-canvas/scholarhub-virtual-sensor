import { toast } from 'react-toastify';

class StudentService {
  constructor() {
    this.tableName = 'student';
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
        Fields: ['Name', 'first_name', 'last_name', 'date_of_birth', 'grade', 'enrollment_date', 'contact_email', 'contact_phone', 'address', 'status']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'first_name', 'last_name', 'date_of_birth', 'grade', 'enrollment_date', 'contact_email', 'contact_phone', 'address', 'status']
      };
      
      const response = await client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching student with ID ${id}:`, error);
      return null;
    }
  }

  async create(student) {
    try {
      const client = this.getApperClient();
      const params = {
        records: [{
          Name: `${student.firstName} ${student.lastName}`,
          first_name: student.firstName,
          last_name: student.lastName,
          date_of_birth: student.dateOfBirth,
          grade: student.grade,
          enrollment_date: student.enrollmentDate || new Date().toISOString().split('T')[0],
          contact_email: student.contactEmail,
          contact_phone: student.contactPhone || '',
          address: student.address || '',
          status: student.status || 'Active'
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
      console.error('Error creating student:', error);
      throw error;
    }
  }

async update(id, updates) {
    try {
      // If ID is 0 or falsy, this is a new record - use create method instead
      if (!id || parseInt(id) === 0) {
        return await this.create(updates);
      }
      
      const client = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updates.firstName && updates.lastName ? `${updates.firstName} ${updates.lastName}` : undefined,
          first_name: updates.firstName,
          last_name: updates.lastName,
          date_of_birth: updates.dateOfBirth,
          grade: updates.grade,
          enrollment_date: updates.enrollmentDate,
          contact_email: updates.contactEmail,
          contact_phone: updates.contactPhone,
          address: updates.address,
          status: updates.status
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
      console.error('Error updating student:', error);
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
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  async searchByName(query) {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'first_name', 'last_name', 'date_of_birth', 'grade', 'enrollment_date', 'contact_email', 'contact_phone', 'address', 'status'],
        where: [
          {
            FieldName: 'Name',
            Operator: 'Contains',
            Values: [query]
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
      console.error('Error searching students:', error);
      throw error;
    }
  }

  async getByGrade(grade) {
    try {
      const client = this.getApperClient();
      const params = {
        Fields: ['Name', 'first_name', 'last_name', 'date_of_birth', 'grade', 'enrollment_date', 'contact_email', 'contact_phone', 'address', 'status'],
        where: [
          {
            FieldName: 'grade',
            Operator: 'ExactMatch',
            Values: [grade]
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
      console.error('Error fetching students by grade:', error);
      throw error;
    }
  }
}

export default new StudentService();