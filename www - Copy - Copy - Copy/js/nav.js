(function () {
  'use strict';

  /* ===== SECTION NAVIGATION ===== */
  window.showSection = function (sectionId) {

    // Hide all sections
    document.querySelectorAll('.section')
      .forEach(section => section.classList.remove('active'));

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');

    /* Update top bar title */
    try {
      const titleMap = {
        dashboard:  'Dashboard',
        attendance: 'Attendance',
        students:   'Students',
        schedule:   'Schedule',
        adminDashboard: 'Admin Dashboard',
        usersSection: 'Users',
        reportsSection: 'Report',
      };

      const heading = document.querySelector('.topbar-inner h1');
      if (heading) {
        heading.textContent =
          titleMap[sectionId] || sectionId;
      }

    } catch (e) {}
  };

  /* ===== SIDEBAR ACTIVE LINK ===== */
  window.setActiveNav = function (element) {

    document.querySelectorAll('.sidebar-nav a')
      .forEach(link => link.classList.remove('active'));

    if (element && element.classList) {
      element.classList.add('active');
    }
  }

})();