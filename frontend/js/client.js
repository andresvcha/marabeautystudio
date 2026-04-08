document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('client-calendar')) return;

    await renderCalendar('client-calendar', false);

    document.getElementById('prev-week-btn').addEventListener('click', async () => {
        if (currentWeek > 1) { currentWeek--; await renderCalendar('client-calendar', false); }
    });
    document.getElementById('next-week-btn').addEventListener('click', async () => {
        if (currentWeek < 52) { currentWeek++; await renderCalendar('client-calendar', false); }
    });

    document.querySelectorAll('.close-btn, .btn-secondary[data-modal-id]').forEach(btn => {
        btn.addEventListener('click', () => hideModal(btn.dataset.modalId));
    });

    // Cancelación por link de email (?cancel=ID)
    const urlParams = new URLSearchParams(window.location.search);
    const cancelId = urlParams.get('cancel');
    if (cancelId) {
        selectedSlotInfo = { id: parseInt(cancelId), type: 'existing' };
        showModal('cancel-modal');
    }

    document.getElementById('book-action-btn').addEventListener('click', () => {
        if (selectedSlotInfo && selectedSlotInfo.type === 'existing') showModal('book-modal');
    });

    document.getElementById('book-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedSlotInfo || selectedSlotInfo.type !== 'existing') return;
        const name = document.getElementById('client-name').value;
        const email = document.getElementById('client-email').value;
        try {
            await apiFetch(`/appointments/${selectedSlotInfo.id}/book`, {
                method: 'POST',
                body: JSON.stringify({ name, email }),
            });
            hideModal('book-modal');
            await renderCalendar('client-calendar', false);
            showAlert('¡Cita reservada con éxito!', 'success', 'client');
        } catch (error) {
            hideModal('book-modal');
            await renderCalendar('client-calendar', false);
            showAlert(error.message || 'Error al reservar la cita.', 'error', 'client');
        }
    });

    document.getElementById('confirm-cancel-btn').addEventListener('click', async () => {
        if (!selectedSlotInfo || selectedSlotInfo.type !== 'existing') return;
        try {
            await apiFetch(`/appointments/${selectedSlotInfo.id}/cancel`, { method: 'POST' });
            hideModal('cancel-modal');
            await renderCalendar('client-calendar', false);
            showAlert('Tu cita ha sido cancelada.', 'success', 'client');
        } catch (error) {
            showAlert(error.message || 'Error al cancelar la cita.', 'error', 'client');
        }
    });
});
