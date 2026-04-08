document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('admin-calendar')) return;

    if (!getToken()) {
        window.location.href = 'admin.html';
        return;
    }

    populateTimeSelectors();
    await renderCalendar('admin-calendar', true);

    document.getElementById('prev-week-btn').addEventListener('click', async () => {
        if (currentWeek > 1) { currentWeek--; await renderCalendar('admin-calendar', true); }
    });
    document.getElementById('next-week-btn').addEventListener('click', async () => {
        if (currentWeek < 52) { currentWeek++; await renderCalendar('admin-calendar', true); }
    });

    document.querySelectorAll('.close-btn, .btn-secondary[data-modal-id]').forEach(btn => {
        btn.addEventListener('click', () => hideModal(btn.dataset.modalId));
    });

    document.getElementById('show-create-modal-btn').addEventListener('click', () => showModal('create-modal'));
    document.getElementById('show-delete-modal-btn').addEventListener('click', () => {
        if (selectedSlotInfo && selectedSlotInfo.type === 'existing') showModal('delete-modal');
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('mara_token');
        window.location.href = 'admin.html';
    });

    document.getElementById('create-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('new-date').value;
        const startTime = document.getElementById('new-time-start').value;
        const endTime = document.getElementById('new-time-end').value;
        if (!date || !startTime || !endTime) {
            showAlert('Debes seleccionar fecha y horas.', 'error', 'admin');
            return;
        }
        try {
            const result = await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify({ date, startTime, endTime }),
            });
            hideModal('create-modal');
            await renderCalendar('admin-calendar', true);
            showAlert(result.message, 'success', 'admin');
        } catch (error) {
            showAlert(error.message, 'error', 'admin');
        }
    });

    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        if (!selectedSlotInfo || selectedSlotInfo.type !== 'existing') return;
        try {
            await apiFetch(`/appointments/${selectedSlotInfo.id}`, { method: 'DELETE' });
            hideModal('delete-modal');
            await renderCalendar('admin-calendar', true);
            showAlert('La cita ha sido eliminada.', 'success', 'admin');
        } catch (error) {
            showAlert(error.message, 'error', 'admin');
        }
    });
});
