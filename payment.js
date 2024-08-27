// Konstanta pro API klíč (v produkci by měla být bezpečně uložena na serveru)
const API_KEY = '';

document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submitButton');
    const orderConfirmation = document.getElementById('orderConfirmation');
    const submitPaymentButton = document.getElementById('submitPaymentButton');
    const backToStep1Button = document.getElementById('backToStep1Button');

    // Zobrazení potvrzení objednávky
    submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateForm()) {
            document.querySelector('form').classList.add('hidden');
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
        document.querySelector('form').classList.remove('hidden');
    });

    function validateForm() {
        // Implementujte validaci formuláře
        return true; // Vraťte true, pokud je formulář validní
    }

    function validatePaymentForm() {
        // Implementujte validaci platebního formuláře
        return true; // Vraťte true, pokud je platební formulář validní
    }

    function updateOrderSummary() {
        // Implementujte aktualizaci shrnutí objednávky
        const orderSummary = document.getElementById('orderSummary');
        orderSummary.innerHTML = '<p>Zde bude shrnutí vaší objednávky...</p>';
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
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                amount: 1000, // Částka v nejmenších jednotkách měny (např. centy)
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
            return { success: true, paymentId: result.id };
        } else {
            return { success: false, message: result.error.message };
        }
    }
});