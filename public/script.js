let currentStep = 1;

document.addEventListener('DOMContentLoaded', function() {
    initializeComponents();
    setupMultiStepForm();
    initAddressSuggestions();
});

function initializeComponents() {
    console.log('Initializing components');
    const customerTypeRadios = document.querySelectorAll('input[name="customerType"]');
    const companyFields = document.getElementById('companyFields');

    console.log('Number of customerType radios found:', customerTypeRadios.length);
    console.log('companyFields element:', companyFields);

    customerTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('Radio changed to:', this.value);
            if (this.value === 'company') {
                companyFields.style.display = 'block';
                document.getElementById('nazevSpolecnostiPole').style.display = 'block';
            } else {
                companyFields.style.display = 'none';
                document.getElementById('nazevSpolecnostiPole').style.display = 'none';
                document.getElementById('dicPole').style.display = 'none';
            }
        });
    });
}

function setupMultiStepForm() {
    const form = document.getElementById('zakaznikForm');
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');
    const tosCheckbox = document.getElementById('tosCheckbox');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');

    nextButton.addEventListener('click', async function (e) {
        e.preventDefault();
        if (validateStep1()) {
            currentStep = 2;
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
        }
    });

    tosCheckbox.addEventListener('change', function () {
        submitButton.disabled = !this.checked;
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (currentStep === 2 && tosCheckbox.checked) {
            const paymentLink = await createInvoiceNinjaClient();
            if (paymentLink) {
                await addSubscriberToEcomail();
                window.location.href = paymentLink;
            }
        }
    });
}

async function hledatFirmu(ic) {
    console.log('Hledání firmy s IČ:', ic);
    try {
        const response = await fetch(`/api/ares?ic=${ic}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('ARES data:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        document.getElementById('nazevSpolecnosti').value = data.obchodniJmeno || '';

        const adresa = `${data.sidlo.ulice || ''} ${data.sidlo.cisloDomovni || ''}${data.sidlo.cisloOrientacni ? '/' + data.sidlo.cisloOrientacni : ''}, ${data.sidlo.obec || ''}, ${data.sidlo.psc || ''}`.trim();
        document.getElementById('adresa').value = adresa;

        if (data.dic) {
            document.getElementById('dic').value = data.dic;
            document.getElementById('dicPole').style.display = 'block';
        } else {
            document.getElementById('dic').value = 'Není plátce DPH';
            document.getElementById('dicPole').style.display = 'none';
        }

        alert('Údaje firmy byly úspěšně načteny');
    } catch (error) {
        console.error('Chyba při hledání firmy:', error);
        alert(`Nepodařilo se načíst údaje firmy: ${error.message}`);
    }
}

function initAddressSuggestions() {
    console.log('Initializing address suggestions');

    const adresaInput = document.getElementById('adresa');
    const adresaSuggestions = document.getElementById('adresaSuggestions');
    let suggestionTimeout;

    adresaInput.addEventListener('input', function () {
        clearTimeout(suggestionTimeout);
        suggestionTimeout = setTimeout(async () => {
            const query = this.value;
            if (query.length > 2) {
                try {
                    const url = `https://api.mapy.cz/v1/suggest?apiKey=9XaTSz3fWU_yHEXdZpBT9O0Cj&query=${encodeURIComponent(query)}&type=street&limit=5&bounds=48.5370786,12.0921668|51.0746358,18.8927040`;
                    const response = await fetch(url);
                    const data = await response.json();
                    adresaSuggestions.innerHTML = '';
                    if (data.result && data.result.length > 0) {
                        data.result.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = item.title;
                            div.classList.add('p-2', 'hover:bg-gray-100', 'cursor-pointer');
                            div.addEventListener('click', function () {
                                adresaInput.value = item.title;
                                adresaSuggestions.classList.add('hidden');
                            });
                            adresaSuggestions.appendChild(div);
                        });
                        adresaSuggestions.classList.remove('hidden');
                    } else {
                        adresaSuggestions.classList.add('hidden');
                    }
                } catch (error) {
                    console.error('Chyba při načítání návrhů adres:', error);
                    adresaSuggestions.classList.add('hidden');
                }
            } else {
                adresaSuggestions.classList.add('hidden');
            }
        }, 300);
    });

    document.addEventListener('click', function (e) {
        if (e.target !== adresaInput && e.target !== adresaSuggestions) {
            adresaSuggestions.classList.add('hidden');
        }
    });
}

function validateStep1() {
    // Implement your validation logic here
    return true; // Return false if validation fails
}

async function createInvoiceNinjaClient() {
    const form = document.getElementById('zakaznikForm');
    const formData = new FormData(form);

    const clientData = {
        name: `${formData.get('jmeno')} ${formData.get('prijmeni')}`,
        contact: {
            email: formData.get('email'),
            phone: formData.get('telefon')
        },
        address: {
            address1: formData.get('adresa'),
        }
    };

    try {
        const response = await fetch('/api/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            throw new Error('Failed to create client in Invoice Ninja');
        }

        const data = await response.json();
        console.log('Invoice Ninja client created:', data);
        return data.paymentLink;
    } catch (error) {
        console.error('Error creating Invoice Ninja client:', error);
        alert('Chyba při vytváření zákazníka. Zkuste to prosím znovu.');
    }
}

async function addSubscriberToEcomail() {
    const form = document.getElementById('zakaznikForm');
    const formData = new FormData(form);

    const subscriberData = {
        email: formData.get('email'),
        name: `${formData.get('jmeno')} ${formData.get('prijmeni')}`,
        subscribe: document.getElementById('newsletterCheckbox').checked
    };

    try {
        const response = await fetch('/api/add-subscriber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriberData)
        });

        if (!response.ok) {
            throw new Error('Failed to add subscriber to Ecomail');
        }

        console.log('Subscriber added to Ecomail');
    } catch (error) {
        console.error('Error adding subscriber to Ecomail:', error);
    }
}