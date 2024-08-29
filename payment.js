// import { createEcomailList } from './ecoMail.js';

const API_KEY_NJ = 'l9lqOFBTrOV4nlV4bSgRwBONyGoQvJt9Ib5qmM9w6F5oc0ny3jHoztzTD6ZzoQQR';

document.addEventListener('DOMContentLoaded', function() {
    const customerForm = document.getElementById('customerForm');
    const submitButton = document.getElementById('submitButton');
    const orderConfirmation = document.getElementById('orderConfirmation');
    const submitPaymentButton = document.getElementById('submitPaymentButton');
    const backToStep1Button = document.getElementById('backToStep1Button');
    const btnDomacnost = document.getElementById('btnDomacnost');
    const btnFirma = document.getElementById('btnFirma');
    const firmaPole = document.getElementById('firmaPole');
    const icInput = document.getElementById('ic');

    // Přepínání mezi domácností a firmou
    btnDomacnost.addEventListener('click', function () {
        firmaPole.classList.add('hidden');
        icInput.removeAttribute('required');
        btnDomacnost.classList.remove('bg-gray-300', 'text-gray-700');
        btnDomacnost.classList.add('bg-blue-500', 'text-white');
        btnFirma.classList.remove('bg-blue-500', 'text-white');
        btnFirma.classList.add('bg-gray-300', 'text-gray-700');
    });

    btnFirma.addEventListener('click', function () {
        firmaPole.classList.remove('hidden');
        icInput.setAttribute('required', '');
        btnFirma.classList.remove('bg-gray-300', 'text-gray-700');
        btnFirma.classList.add('bg-blue-500', 'text-white');
        btnDomacnost.classList.remove('bg-blue-500', 'text-white');
        btnDomacnost.classList.add('bg-gray-300', 'text-gray-700');
    });

    // Zobrazení potvrzení objednávky
    customerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            customerForm.classList.add('hidden');
            orderConfirmation.classList.remove('hidden');
            updateOrderSummary();
        }
    });

    // Zpracování platby
    submitPaymentButton.addEventListener('click', async function(e) {
        e.preventDefault();
        if (validatePaymentForm()) {
            try {
                const paymentResult = await processPayment();
                if (paymentResult.success) {
                    alert('Platba byla úspěšně zpracována!');
                    // Zde můžete přesměrovat uživatele na stránku s potvrzením
                } else {
                    alert('Platba se nezdařila: ' + paymentResult.message);
                }
            } catch (error) {
                console.error('Chyba při zpracování platby:', error);
                alert('Došlo k chybě při zpracování platby. Zkuste to prosím znovu.');
            }
        }
    });

    // Návrat zpět na první krok
    backToStep1Button.addEventListener('click', function() {
        orderConfirmation.classList.add('hidden');
        customerForm.classList.remove('hidden');
    });

    function validateForm() {
        const requiredFields = customerForm.querySelectorAll('[required]');
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('border-red-500');
            } else {
                field.classList.remove('border-red-500');
            }
        });
        return isValid;
    }

    function validatePaymentForm() {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiryDate = document.getElementById('expiryDate').value.trim();
        const cvv = document.getElementById('cvv').value.trim();

        return cardNumber && expiryDate && cvv;
    }

    function updateOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        const formData = new FormData(customerForm);
        let summaryHTML = '<h3>Shrnutí objednávky:</h3><ul>';
        for (let [key, value] of formData.entries()) {
            if (value) {
                summaryHTML += `<li><strong>${key}:</strong> ${value}</li>`;
            }
        }
        summaryHTML += '</ul>';
        orderSummary.innerHTML = summaryHTML;
    }

    async function processPayment() {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        // Vytvoření platby pomocí Invoicing API
        const response = await fetch('https://api.invoicing.co/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY_NJ}`
            },
            body: JSON.stringify({
                amount: 200, // Částka v nejmenších jednotkách měny (např. centy)
                currency: 'CZK',
                card: {
                    number: cardNumber,
                    exp_month: expiryDate.split('/')[0],
                    exp_year: '20' + expiryDate.split('/')[1],
                    cvc: cvv
                },
                description: 'Platba za služby IT-DOMA'
            })
        });

        const result = await response.json();

        if (response.ok) {
            await createEcomailList(); // Volání funkce z ecoMail.js
            return { success: true, paymentId: result.id };
        } else {
            return { success: false, message: result.error.message };
        }
    }
});