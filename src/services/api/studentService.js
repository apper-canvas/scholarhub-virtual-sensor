import studentData from '../mockData/student.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StudentService {
  constructor() {
    this.data = [...studentData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const student = this.data.find(item => item.id === id);
    return student ? { ...student } : null;
  }

  async create(student) {
    await delay(400);
    const newStudent = {
      ...student,
      id: Date.now().toString(),
      enrollmentDate: new Date().toISOString().split('T')[0]
    };
    this.data.push(newStudent);
    return { ...newStudent };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Student not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Student not found');
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async searchByName(query) {
    await delay(200);
    const filtered = this.data.filter(student => 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query.toLowerCase())
    );
    return [...filtered];
  }

  async getByGrade(grade) {
    await delay(200);
    const filtered = this.data.filter(student => student.grade === grade);
    return [...filtered];
  }
}

export default new StudentService();