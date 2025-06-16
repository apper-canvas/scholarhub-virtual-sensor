import attendanceData from '../mockData/attendance.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AttendanceService {
  constructor() {
    this.data = [...attendanceData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const attendance = this.data.find(item => item.id === id);
    return attendance ? { ...attendance } : null;
  }

  async create(attendance) {
    await delay(400);
    const newAttendance = {
      ...attendance,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    this.data.push(newAttendance);
    return { ...newAttendance };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Attendance record not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Attendance record not found');
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async getByStudent(studentId) {
    await delay(200);
    const filtered = this.data.filter(attendance => attendance.studentId === studentId);
    return [...filtered];
  }

  async getByDate(date) {
    await delay(200);
    const filtered = this.data.filter(attendance => attendance.date === date);
    return [...filtered];
  }

  async markAttendance(studentId, classId, status, reason = '') {
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    const existing = this.data.find(
      record => record.studentId === studentId && 
      record.classId === classId && 
      record.date === today
    );

    if (existing) {
      return this.update(existing.id, { status, reason });
    } else {
      return this.create({ studentId, classId, status, reason });
    }
  }
}

export default new AttendanceService();