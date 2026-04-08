function showAlert(message, type = 'info', context = 'client') {
    const container = document.getElementById(`alert-container-${context}`);
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 4000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    const formatOptions = {
        timeZone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    };
    const isAdminCtx = !!document.getElementById('admin-calendar');

    if (['delete-modal', 'book-modal', 'cancel-modal'].includes(modalId)) {
        if (!selectedSlotInfo || selectedSlotInfo.type !== 'existing') {
            showAlert('Por favor, selecciona una cita válida.', 'error', isAdminCtx ? 'admin' : 'client');
            return;
        }
        const appointment = appointments.find(a => a.id === selectedSlotInfo.id);
        if (!appointment) {
            showAlert('La cita seleccionada ya no existe.', 'error', isAdminCtx ? 'admin' : 'client');
            return;
        }

        const dtStr = appointment.dateTime.toLocaleString(locale, formatOptions);
        if (modalId === 'delete-modal') document.getElementById('delete-cita-datetime').value = dtStr;
        if (modalId === 'book-modal') {
            document.getElementById('cita-datetime').value = dtStr;
            document.getElementById('client-name').value = '';
            document.getElementById('client-email').value = '';
        }
        if (modalId === 'cancel-modal') document.getElementById('cancel-cita-datetime').value = dtStr;

    } else if (modalId === 'create-modal') {
        document.getElementById('create-form').reset();
        if (selectedSlotInfo && selectedSlotInfo.type === 'empty') {
            const selectedDate = new Date(selectedSlotInfo.datetime);
            const y = selectedDate.getFullYear();
            const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const d = selectedDate.getDate().toString().padStart(2, '0');
            document.getElementById('new-date').value = `${y}-${m}-${d}`;
            const h = selectedDate.getHours().toString().padStart(2, '0');
            document.getElementById('new-time-start').value = `${h}:00`;
            document.getElementById('new-time-end').value = '';
        } else {
            document.getElementById('new-time-start').value = '';
            document.getElementById('new-time-end').value = '';
        }
    }

    modal.classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    selectedSlotInfo = null;
    const bookBtn = document.getElementById('book-action-btn');
    const deleteBtn = document.getElementById('show-delete-modal-btn');
    if (bookBtn) bookBtn.disabled = true;
    if (deleteBtn) deleteBtn.disabled = true;
}
