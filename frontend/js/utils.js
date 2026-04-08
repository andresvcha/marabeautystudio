function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDateForWeek(year, week) {
    const d = new Date(year, 0, 1);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1) + (week - 1) * 7);
    d.setHours(0, 0, 0, 0);
    return d;
}
