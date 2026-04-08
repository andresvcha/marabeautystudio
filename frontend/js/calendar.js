// Estado compartido del calendario (accesible por ui.js, dashboard.js y client.js)
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const locale = 'es-CO';
const timeZone = 'America/Bogota';

let appointments = [];
let selectedSlotInfo = null;
let currentYear = new Date().getFullYear();
let currentWeek = getISOWeek(new Date());

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
