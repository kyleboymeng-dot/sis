(function () {
  'use strict';

  /* =====================================================
     ADD CLASS MODAL
  ===================================================== */
  function initAddClassModal() {
    const addBtn  = document.querySelector('.btn-add');
    const modal   = document.getElementById('addClassModal');
    const form    = document.getElementById('addClassForm');
    const cancel  = document.getElementById('cancelAdd');

    if (!addBtn || !modal || !form) return;

    /* Open modal */
    addBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');

      const focus = document.getElementById('className');
      if (focus) focus.focus();
    });

    /* Cancel button */
    if (cancel) {
      cancel.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      });
    }

    /* Click outside modal */
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      }
    });

    /* Submit class */
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name    = document.getElementById('className').value.trim();
      const subject = document.getElementById('classSubject').value.trim();
      const day     = document.getElementById('classDay').value;
      const start   = document.getElementById('startTime').value;
      const end     = document.getElementById('endTime').value;
      const room    = document.getElementById('classRoom').value.trim();

      window.addClassToSchedule({ name, subject, day, start, end, room });
      
      // Update today's schedule display
      if (window.addClassAndUpdateDashboard) {
        window.addClassAndUpdateDashboard({ name, subject, day, start, end, room });
      }

      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      form.reset();
    });
  }

  /* =====================================================
     TEACHER SCHEDULE MODAL
  ===================================================== */
  function initTeacherSchedule() {
    try {
      const openBtn  = document.getElementById('openAddClassBtn');
      const backdrop =
        document.getElementById('addClassBackdrop') ||
        document.getElementById('addClassModal');

      const cancel =
        document.getElementById('ac_cancel') ||
        document.getElementById('cancelAdd');

      const confirm =
        document.getElementById('ac_confirm');

      if (!openBtn || !backdrop) return;


      openBtn.addEventListener('click', () => {
        backdrop.classList.remove('hidden');
        backdrop.setAttribute('aria-hidden', 'false');

        const focus =
          document.getElementById('ac_className') ||
          document.getElementById('className');

        if (focus) focus.focus();
      });


      if (cancel) {
        cancel.addEventListener('click', () => {
          backdrop.classList.add('hidden');
          backdrop.setAttribute('aria-hidden', 'true');
        });
      }


      if (confirm) {
        confirm.addEventListener('click', () => {

          const name =
            document.getElementById('ac_className')?.value.trim();

          const subject =
            document.getElementById('ac_subject')?.value.trim();

          const day   = document.getElementById('ac_day')?.value;
          const start = document.getElementById('ac_start')?.value;
          const end   = document.getElementById('ac_end')?.value;

          const room =
            document.getElementById('ac_room')?.value.trim();

          const classObj = { name, subject, day, start, end, room };
          
          window.addClassToSchedule(classObj);
          
          // Update today's schedule display
          if (window.addClassAndUpdateDashboard) {
            window.addClassAndUpdateDashboard(classObj);
          }

          backdrop.classList.add('hidden');
          backdrop.setAttribute('aria-hidden', 'true');

          [
            'ac_className',
            'ac_subject',
            'ac_day',
            'ac_start',
            'ac_end',
            'ac_room'
          ].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
          });
        });
      }

    } catch (err) {}
  }



  /* =====================================================
     EXPORT FUNCTIONS
  ===================================================== */
  window.initAddClassModal  = initAddClassModal;
  window.initTeacherSchedule = initTeacherSchedule;

})();