import classData from '../mockData/class.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ClassService {
  constructor() {
    this.data = [...classData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const classItem = this.data.find(item => item.id === id);
    return classItem ? { ...classItem } : null;
  }

  async create(classItem) {
    await delay(400);
    const newClass = {
      ...classItem,
      id: Date.now().toString(),
      enrolledCount: 0
    };
    this.data.push(newClass);
    return { ...newClass };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Class not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Class not found');
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async getByTeacher(teacherId) {
    await delay(200);
    const filtered = this.data.filter(classItem => classItem.teacherId === teacherId);
    return [...filtered];
  }
}

export default new ClassService();