// src/data/guests.js
// 200 Guests — id is a zero-padded 3-digit string

const guests = Array.from({ length: 200 }, (_, i) => {
    const id = String(i + 1).padStart(3, '0');
    return {
        id: id,
        name: `Guest #${id}`
    };
});

export default guests;

export function getGuestById(id) {
    return guests.find((g) => g.id === id) || null;
}
