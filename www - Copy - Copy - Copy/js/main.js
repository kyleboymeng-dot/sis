/* main.js — Loader / Bootstrap
   Dynamically loads modular JS files in order
   and initializes the main app features.
*/

(function () {
  'use strict';

  /* ==========================
     Scripts to load (in order)
  ========================== */
  const SCRIPTS = [
    'js/teacher/ui.js',
    'js/teacher/calendar.js',
    'js/teacher/schedule.js',
    'js/modals.js',
    'js/nav.js',
  ];

  /* ==========================
     Load one script
  ========================== */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src = src;
      script.async = false; // keep execution order

      script.onload = () => {
        console.log('Loaded:', src);
        resolve(src);
      };

      script.onerror = () => {
        reject(new Error('Failed to load ' + src));
      };

      document.head.appendChild(script);
    });
  }

  /* ==========================
     Load all scripts sequentially
  ========================== */
  function loadAllSequential(list) {
    return list.reduce(
      (promise, src) => promise.then(() => loadScript(src)),
      Promise.resolve()
    );
  }

  /* ==========================
     Start after DOM is ready
  ========================== */
  document.addEventListener('DOMContentLoaded', () => {
    loadAllSequential(SCRIPTS)
      .catch(err => {
        console.error('Script load error:', err);
      })
      .then(() => {
        /* ==========================
           App bootstrap functions
           (Run only if available)
        ========================== */

        try { window.createChart?.(); } catch {}
        try { window.renderDashboard?.(); } catch {}
        try { window.renderCalendar?.(); } catch {}
        try { window.initAddClassModal?.(); } catch {}
        try { window.initTeacherSchedule?.(); } catch {}
        try { window.ensureTimetableGrid?.(); } catch {}
        try { window.initTimetableScroller?.(); } catch {}
        
      });
  });

})();