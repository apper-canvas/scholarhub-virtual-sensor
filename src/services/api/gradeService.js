import gradeData from '../mockData/grade.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GradeService {
  constructor() {
    this.data = [...gradeData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const grade = this.data.find(item => item.id === id);
    return grade ? { ...grade } : null;
  }

  async create(grade) {
    await delay(400);
    const newGrade = {
      ...grade,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    this.data.push(newGrade);
    return { ...newGrade };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Grade not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Grade not found');
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async getByStudent(studentId) {
    await delay(200);
    const filtered = this.data.filter(grade => grade.studentId === studentId);
    return [...filtered];
  }

  async getByClass(classId) {
    await delay(200);
    const filtered = this.data.filter(grade => grade.classId === classId);
    return [...filtered];
  }
}

export default new GradeService();