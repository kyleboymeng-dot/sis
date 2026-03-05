(function () {
  'use strict';





  /* ===== TIMETABLE HORIZONTAL SCROLLER ===== */
  function initTimetableScroller() {
    try {
      const timetable = document.querySelector('.timetable');
      const grid = document.querySelector('.timetable-grid');
      if (!timetable || !grid) return;

      // Prevent duplicate wrapper
      if (
        grid.parentElement &&
        grid.parentElement.classList.contains('timetable-scroll')
      ) return;


      /* Create scroll wrapper */
      const wrapper = document.createElement('div');
      wrapper.className = 'timetable-scroll';

      timetable.insertBefore(wrapper, grid);
      wrapper.appendChild(grid);


      /* Navigation buttons */
      const nav  = document.createElement('div');
      nav.className = 'timetable-nav';

      const prev = document.createElement('button');
      prev.type = 'button';
      prev.innerHTML = '◀';

      const next = document.createElement('button');
      next.type = 'button';
      next.innerHTML = '▶';

      nav.appendChild(prev);
      nav.appendChild(next);
      timetable.appendChild(nav);


      /* Scroll behavior */
      const scrollAmount =
        Math.round(window.innerWidth * 0.6) || 600;

      prev.addEventListener('click', () =>
        wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      );

      next.addEventListener('click', () =>
        wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      );


      /* Show nav only when needed */
      function updateNav() {
        nav.style.display =
          wrapper.scrollWidth > wrapper.clientWidth
            ? 'flex'
            : 'none';
      }

      updateNav();
      window.addEventListener('resize', updateNav);

    } catch (err) {}
  }


  /* ===== ADD CLASS CARD TO SCHEDULE ===== */
  function addClassToSchedule(cls) {
    try {
      const grid = document.querySelector('.timetable-grid');
      if (!grid) return;

      const headers = Array.from(grid.querySelectorAll('.timetable-head')).slice(1);
      const dayIndex = headers.findIndex(h => h.textContent.trim().toLowerCase() === (cls.day || '').toLowerCase());

      const timeCells = Array.from(grid.querySelectorAll('.time-cell'));
      const startHour = parseInt(cls.start.split(':')[0], 10);
      let timeCell = timeCells.find(tc => tc.textContent.startsWith(`${startHour}:`));

      if (!timeCell) {
        ensureTimetableGrid();
        const refreshed = Array.from(grid.querySelectorAll('.time-cell'));
        timeCell = refreshed.find(tc => tc.textContent.startsWith(`${startHour}:`)) || refreshed[0];
      }

      // Find target day cell
      let target = timeCell ? timeCell.nextElementSibling : null;
      for (let i = 0; i < (dayIndex < 0 ? 0 : dayIndex); i++) {
        if (target) target = target.nextElementSibling;
      }
      if (!target) return;

      // Create class card
      const card = document.createElement('div');
      card.className = 'class-card';
      card.innerHTML = `
        <div class="class-accent"></div>
        <div class="class-body">
          <div class="class-title">${cls.name}</div>
          <div class="class-sub">${cls.subject}</div>
          <div class="class-meta">⏱ ${cls.start} - ${cls.end} &nbsp; · &nbsp; 📍 ${cls.room}</div>
        </div>
      `;
      target.appendChild(card);
    } catch (err) {
      console.error(err);
    }
  }

  /* ===== EXPORT GLOBAL FUNCTIONS ===== */
  window.ensureTimetableGrid   = ensureTimetableGrid;
  window.initTimetableScroller = initTimetableScroller;
  window.addClassToSchedule    = addClassToSchedule;
})();