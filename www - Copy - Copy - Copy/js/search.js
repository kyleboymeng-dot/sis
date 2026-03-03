/* search.js - Search functionality for all modules
   Provides real-time search across students, attendance, and schedule
*/

(function() {
  'use strict';

  // Get search input
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return; // Exit if search input doesn't exist

  // Debounce function to prevent rapid search calls
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Search for students in the student list
  function searchStudents(query) {
    const studentRows = document.querySelectorAll('.student-list tbody tr');
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;

    studentRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let found = false;

      // Search in: student name, ID, grade, section
      for (let i = 0; i < cells.length; i++) {
        const text = cells[i].textContent.toLowerCase();
        if (text.includes(lowerQuery)) {
          found = true;
          break;
        }
      }

      row.style.display = found ? '' : 'none';
      if (found) visibleCount++;
    });

    return visibleCount;
  }

  // Search for attendance records in the attendance table
  function searchAttendance(query) {
    const attendanceRows = document.querySelectorAll('.studentTable tbody tr');
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;

    attendanceRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let found = false;

      // Search in all cells (student name, ID, section, status, etc.)
      for (let i = 0; i < cells.length; i++) {
        const text = cells[i].textContent.toLowerCase();
        if (text.includes(lowerQuery)) {
          found = true;
          break;
        }
      }

      row.style.display = found ? '' : 'none';
      if (found) visibleCount++;
    });

    return visibleCount;
  }

  // Search for attendance history records
  function searchAttendanceHistory(query) {
    const historyRows = document.querySelectorAll('#attendanceHistoryTbody tr');
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;

    historyRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let found = false;

      for (let i = 0; i < cells.length; i++) {
        const text = cells[i].textContent.toLowerCase();
        if (text.includes(lowerQuery)) {
          found = true;
          break;
        }
      }

      row.style.display = found ? '' : 'none';
      if (found) visibleCount++;
    });

    return visibleCount;
  }

  // Search for schedule/timetable classes
  function searchSchedule(query) {
    const classCards = document.querySelectorAll('.class-card');
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;

    classCards.forEach(card => {
      const title = card.querySelector('.class-title')?.textContent.toLowerCase() || '';
      const subject = card.querySelector('.class-sub')?.textContent.toLowerCase() || '';
      const meta = card.querySelector('.class-meta')?.textContent.toLowerCase() || '';

      const found = title.includes(lowerQuery) || 
                   subject.includes(lowerQuery) || 
                   meta.includes(lowerQuery);

      card.style.display = found ? '' : 'none';
      if (found) visibleCount++;
    });

    return visibleCount;
  }

  // Search for users in the admin users table
  function searchUsers(query) {
    const userRows = document.querySelectorAll('#usersTbody tr');
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;

    userRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let found = false;

      // Search in: user name, email, role
      for (let i = 0; i < cells.length; i++) {
        const text = cells[i].textContent.toLowerCase();
        if (text.includes(lowerQuery)) {
          found = true;
          break;
        }
      }

      row.style.display = found ? '' : 'none';
      if (found) visibleCount++;
    });

    return visibleCount;
  }

  // Main search handler
  const handleSearch = debounce(function() {
    const query = searchInput.value.trim();

    if (!query) {
      // Show all if search is empty
      document.querySelectorAll('.student-list tbody tr').forEach(row => row.style.display = '');
      document.querySelectorAll('.studentTable tbody tr').forEach(row => row.style.display = '');
      document.querySelectorAll('#attendanceHistoryTbody tr').forEach(row => row.style.display = '');
      document.querySelectorAll('.class-card').forEach(card => card.style.display = '');
      document.querySelectorAll('#usersTbody tr').forEach(row => row.style.display = '');
      return;
    }

    // Search in active section
    const activeSection = document.querySelector('.section.active');
    if (!activeSection) return;

    // Determine which search to run based on active section
    if (activeSection.id === 'students') {
      searchStudents(query);
    } else if (activeSection.id === 'attendance') {
      // Check if we're in mark attendance or view history tab
      const markAttendanceTab = document.getElementById('mark-attendance-tab');
      const viewHistoryTab = document.getElementById('view-history-tab');

      if (markAttendanceTab && markAttendanceTab.classList.contains('active')) {
        searchAttendance(query);
      } else if (viewHistoryTab && viewHistoryTab.classList.contains('active')) {
        searchAttendanceHistory(query);
      }
    } else if (activeSection.id === 'schedule') {
      searchSchedule(query);
    } else if (activeSection.id === 'users-section') {
      searchUsers(query);
    }
  }, 300); // 300ms debounce delay

  // Add event listeners
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('keyup', handleSearch);

  // Clear search on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      handleSearch();
    }
  });

  // Clear search when switching sections
  document.addEventListener('click', (e) => {
    if (e.target && e.target.closest('[onclick*="showSection"]')) {
      // Clear search input and reset visibility when changing sections
      setTimeout(() => {
        searchInput.value = '';
        handleSearch();
      }, 100);
    }
  });

  console.log('Search functionality initialized');

})();
