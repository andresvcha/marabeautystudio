document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000/api';

    let appointments = []; // Cache local de citas de la semana visible
    let selectedSlotInfo = null;
    let currentYear = new Date().getFullYear();
    let currentWeek = getISOWeek(new Date());

    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const locale = 'es-CO';
    const timeZone = 'America/Bogota';

    // ==================== HELPERS API ====================

    function getToken() {
        return localStorage.getItem('mara_token');
    }

    async function apiFetch(path, options = {}) {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${path}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw { status: res.status, message: data.message || 'Error en la solicitud.' };
        return data;
    }

    function getISOWeek(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    // ==================== CALENDARIO ====================

    function getDateForWeek(year, week) {
        const d = new Date(year, 0, 1);
        const day = d.getDay();
        d.setDate(d.getDate() - day + (day === 0 ? -6 : 1) + (week - 1) * 7);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function updateNavButtons() {
        const prevBtn = document.getElementById('prev-week-btn');
        const nextBtn = document.getElementById('next-week-btn');
        if (prevBtn && nextBtn) {
            prevBtn.disabled = (currentWeek <= 1);
            nextBtn.disabled = (currentWeek >= 52);
        }
    }

    function populateTimeSelectors() {
        const startSelector = document.getElementById('new-time-start');
        const endSelector = document.getElementById('new-time-end');
        if (!startSelector || !endSelector) return;

        startSelector.innerHTML = '';
        endSelector.innerHTML = '';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'HH:MM';
        placeholder.selected = true;
        placeholder.disabled = true;

        startSelector.appendChild(placeholder.cloneNode(true));
        endSelector.appendChild(placeholder.cloneNode(true));

        for (let i = 8; i <= 18; i++) {
            const hour = i.toString().padStart(2, '0') + ':00';
            startSelector.add(new Option(hour, hour));
        }
        for (let i = 8; i <= 19; i++) {
            const hour = i.toString().padStart(2, '0') + ':00';
            endSelector.add(new Option(hour, hour));
        }
    }

    async function renderCalendar(containerId, isAdmin) {
        const calendarContainer = document.getElementById(containerId);
        if (!calendarContainer) return;

        const weekDisplay = document.getElementById('week-display');
        if (weekDisplay) weekDisplay.textContent = `Semana ${currentWeek} del ${currentYear}`;

        try {
            const data = await apiFetch(`/appointments?week=${currentWeek}&year=${currentYear}`);
            // El API devuelve estado en mayúsculas (AVAILABLE/RESERVED), normalizamos a minúsculas
            appointments = data.map(a => ({
                ...a,
                state: a.state.toLowerCase(),
                dateTime: new Date(a.dateTime),
            }));
        } catch (error) {
            showAlert('Error al cargar las citas. Verifica que el servidor esté activo.', 'error', isAdmin ? 'admin' : 'client');
            appointments = [];
        }

        const startOfWeek = getDateForWeek(currentYear, currentWeek);
        const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        let html = '<div class="grid-header"></div>';
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            html += `<div class="grid-header">${weekDays[i]}<br><span class="date-number">${day.getDate()}</span></div>`;
        }

        const now = new Date();
        hours.forEach(hour => {
            html += `<div class="time-label">${hour}</div>`;
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const cellDate = new Date(startOfWeek);
                cellDate.setDate(startOfWeek.getDate() + dayIndex);
                const [h] = hour.split(':');
                cellDate.setHours(parseInt(h), 0, 0, 0);

                const appointment = appointments.find(a => a.dateTime.getTime() === cellDate.getTime());

                if (cellDate < now) {
                    if (appointment && appointment.state === 'reserved') {
                        const text = isAdmin ? `Reservada:<br>${appointment.client.name}` : 'RESERVADA';
                        html += `<div class="time-slot reserved" data-id="${appointment.id}">${text}</div>`;
                    } else {
                        html += `<div class="time-slot reserved"></div>`;
                    }
                } else {
                    if (appointment) {
                        const text = appointment.state === 'available'
                            ? 'ABIERTO'
                            : (isAdmin ? `Reservada:<br>${appointment.client.name}` : 'RESERVADA');
                        html += `<div class="time-slot ${appointment.state}" data-id="${appointment.id}">${text}</div>`;
                    } else {
                        html += `<div class="time-slot available-empty" data-datetime="${cellDate.toISOString()}"></div>`;
                    }
                }
            }
        });

        calendarContainer.innerHTML = html;
        addSlotEventListeners(containerId, isAdmin);
        updateNavButtons();
    }

    function addSlotEventListeners(containerId, isAdmin) {
        document.querySelectorAll(`#${containerId} .time-slot`).forEach(slot => {
            slot.addEventListener('click', () => {
                if (slot.classList.contains('reserved')) return;

                const wasSelected = slot.classList.contains('selected');
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                selectedSlotInfo = null;

                if (!wasSelected) {
                    slot.classList.add('selected');
                    if (slot.dataset.id) {
                        selectedSlotInfo = { id: parseInt(slot.dataset.id), type: 'existing' };
                    } else if (slot.dataset.datetime) {
                        selectedSlotInfo = { datetime: slot.dataset.datetime, type: 'empty' };
                    }
                }

                const bookBtn = document.getElementById('book-action-btn');
                const deleteBtn = document.getElementById('show-delete-modal-btn');
                if (isAdmin) {
                    if (deleteBtn) deleteBtn.disabled = !(selectedSlotInfo && selectedSlotInfo.type === 'existing');
                } else {
                    if (bookBtn) bookBtn.disabled = !(selectedSlotInfo && selectedSlotInfo.type === 'existing');
                }
            });
        });
    }

    // ==================== ALERTS & MODALS ====================

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

    // ==================== INIT ====================

    async function initializeApp() {

        // ---- PÁGINA DE LOGIN (admin.html) ----
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                try {
                    const { token } = await apiFetch('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ username, password }),
                    });
                    localStorage.setItem('mara_token', token);
                    window.location.href = 'dashboard.html';
                } catch (error) {
                    document.getElementById('login-error').classList.remove('hidden');
                }
            });
            return;
        }

        // ---- DASHBOARD (dashboard.html) ----
        const adminCalendarEl = document.getElementById('admin-calendar');
        if (adminCalendarEl) {
            // Guard: redirigir al login si no hay token
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

            return;
        }

        // ---- PÁGINA CLIENTE (index.html) ----
        const clientCalendarEl = document.getElementById('client-calendar');
        if (clientCalendarEl) {
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
        }
    }

    initializeApp();
});
