import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

async function loadRecords() {
    const recordsList = document.getElementById('recordsList');
    recordsList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, "repairs"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'record-card';
        card.innerHTML = `
            <h2>${data.clientName}</h2>
            <p>Email: ${data.email}</p>
            <p>Telefon: ${data.phone}</p>
            <p>Adresa: ${data.address}</p>
            <p>Problém: ${data.problem}</p>
            <p>Datum: <input type="date" id="date-${doc.id}" value="${data.date}"></p>
            <p>Časové okno: <select id="time-${doc.id}">
                <option value="9:00-18:00" ${data.timeWindow === '9:00-18:00' ? 'selected' : ''}>9:00-18:00</option>
                <option value="18:00-20:00" ${data.timeWindow === '18:00-20:00' ? 'selected' : ''}>18:00-20:00</option>
                <option value="20:00-23:59" ${data.timeWindow === '20:00-23:59' ? 'selected' : ''}>20:00-23:59</option>
            </select></p>
            <button onclick="updateRecord('${doc.id}')">Aktualizovat</button>
        `;
        recordsList.appendChild(card);
    });
}

window.updateRecord = async function(docId) {
    const dateInput = document.getElementById(`date-${docId}`);
    const timeSelect = document.getElementById(`time-${docId}`);

    try {
        await updateDoc(doc(db, "repairs", docId), {
            date: dateInput.value,
            timeWindow: timeSelect.value
        });
        alert('Záznam byl úspěšně aktualizován');
    } catch (error) {
        console.error("Error updating document: ", error);
        alert('Došlo k chybě při aktualizaci záznamu');
    }
}

document.addEventListener('DOMContentLoaded', loadRecords);