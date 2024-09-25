document.addEventListener("DOMContentLoaded", function() {
    const vatIdInput = document.getElementById('ic');
    const fillDetailsButton = document.getElementById('doplnitUdaje');

    fillDetailsButton.addEventListener('click', fetchAresData);

    async function fetchAresData() {
        const vatId = vatIdInput.value.trim();
        if (vatId.length !== 8) {
            alert('IČO musí mít 8 číslic');
            return;
        }

        try {
            const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty/rest/ekonomicke-subjekty/${vatId}`);
            if (!response.ok) {
                throw new Error('Nepodařilo se načíst data z ARES');
            }
            const data = await response.json();
            fillForm(data);
        } catch (error) {
            console.error('Chyba při načítání dat z ARES:', error);
            alert('Nepodařilo se načíst data z ARES. Zkontrolujte IČO a zkuste to znovu.');
        }
    }

    function fillForm(data) {
        // Předpokládáme, že máme odpovídající ID pro každé pole ve formuláři
        document.getElementById('jmeno').value = data.obchodniJmeno || '';
        document.getElementById('autoComplete').value = `${data.sidlo.ulice || ''} ${data.sidlo.cisloDomu || ''}, ${data.sidlo.obec || ''}, ${data.sidlo.psc || ''}`;
        // Můžete přidat další pole podle potřeby
    }

    // Zobrazení/skrytí pole pro firmu na základě výběru typu zákazníka
    const customerTypeInputs = document.querySelectorAll('input[name="customerType"]');
    const companyField = document.getElementById('firmaPole');

    customerTypeInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            if (event.target.value === 'firma') {
                companyField.classList.remove('hidden');
            } else {
                companyField.classList.add('hidden');
            }
        });
    });
});