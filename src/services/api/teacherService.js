import teacherData from '../mockData/teacher.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TeacherService {
  constructor() {
    this.data = [...teacherData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const teacher = this.data.find(item => item.id === id);
    return teacher ? { ...teacher } : null;
  }

  async create(teacher) {
    await delay(400);
    const newTeacher = {
      ...teacher,
      id: Date.now().toString()
    };
    this.data.push(newTeacher);
    return { ...newTeacher };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Teacher not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Teacher not found');
    
    this.data.splice(index, 1);
    return { success: true };
  }
}

export default new TeacherService();