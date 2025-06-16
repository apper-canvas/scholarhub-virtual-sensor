import classService from './classService.js';
import teacherService from './teacherService.js';
import studentService from './studentService.js';
import { parse, format, isWithinInterval } from 'date-fns';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TimetableService {
  constructor() {
    this.scheduleCache = new Map();
  }

  parseSchedule(scheduleString) {
    // Parse schedule strings like "Mon, Wed, Fri 9:00-9:50 AM" or "Daily 2:00-2:50 PM"
    const parts = scheduleString.split(' ');
    const timePart = parts[parts.length - 2]; // "9:00-9:50" or "2:00-2:50"
    const ampm = parts[parts.length - 1]; // "AM" or "PM"
    
    const [startTime, endTime] = timePart.split('-');
    const daysPart = parts.slice(0, -2).join(' '); // "Mon, Wed, Fri" or "Daily"
    
    let days = [];
    if (daysPart.toLowerCase() === 'daily') {
      days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    } else {
      const dayMap = {
        'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 
        'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
      };
      days = daysPart.split(', ').map(day => dayMap[day] || day);
    }

    return {
      days,
      startTime: this.parseTime(startTime, ampm),
      endTime: this.parseTime(endTime, ampm),
      timeSlot: `${startTime}-${endTime} ${ampm}`
    };
  }

  parseTime(timeStr, ampm) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let adjustedHours = hours;
    
    if (ampm === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      adjustedHours = 0;
    }
    
    return adjustedHours * 60 + minutes; // Convert to minutes for easy comparison
  }

  detectConflicts(schedules) {
    const conflicts = [];
    
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const schedule1 = schedules[i];
        const schedule2 = schedules[j];
        
        // Check if any days overlap
        const dayOverlap = schedule1.parsedSchedule.days.some(day => 
          schedule2.parsedSchedule.days.includes(day)
        );
        
        if (dayOverlap) {
          // Check if times overlap
          const timeOverlap = this.isTimeOverlap(
            schedule1.parsedSchedule.startTime,
            schedule1.parsedSchedule.endTime,
            schedule2.parsedSchedule.startTime,
            schedule2.parsedSchedule.endTime
          );
          
          if (timeOverlap) {
            conflicts.push({
              class1: schedule1,
              class2: schedule2,
              overlappingDays: schedule1.parsedSchedule.days.filter(day => 
                schedule2.parsedSchedule.days.includes(day)
              )
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  isTimeOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  async getAll() {
    await delay(300);
    const classes = await classService.getAll();
    const teachers = await teacherService.getAll();
    
    const schedules = classes.map(classItem => {
      const teacher = teachers.find(t => t.id === classItem.teacherId);
      const parsedSchedule = this.parseSchedule(classItem.schedule);
      
      return {
        ...classItem,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
        teacherEmail: teacher ? teacher.email : '',
        parsedSchedule
      };
    });

    const conflicts = this.detectConflicts(schedules);
    
    // Mark conflicting classes
    const conflictingClassIds = new Set();
    conflicts.forEach(conflict => {
      conflictingClassIds.add(conflict.class1.id);
      conflictingClassIds.add(conflict.class2.id);
    });

    schedules.forEach(schedule => {
      schedule.hasConflict = conflictingClassIds.has(schedule.id);
    });

    return { schedules, conflicts };
  }

  async getByTeacher(teacherId) {
    await delay(200);
    const { schedules } = await this.getAll();
    return schedules.filter(schedule => schedule.teacherId === teacherId);
  }

  async getByStudent(studentId) {
    await delay(200);
    // In a real implementation, this would check student enrollments
    // For now, return all schedules as students could potentially be in any class
    const { schedules } = await this.getAll();
    return schedules;
  }

  async getConflicts() {
    await delay(200);
    const { conflicts } = await this.getAll();
    return conflicts;
  }

  formatTimeSlot(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }
}

export default new TimetableService();