document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    initializeComponents();
});

function initializeComponents() {
    console.log('Initializing components');

    const btnDomacnost = document.getElementById('btnDomacnost');
    const btnFirma = document.getElementById('btnFirma');
    const firmaPole = document.getElementById('firmaPole');
    const icInput = document.getElementById('ic');
    const hledatICBtn = document.getElementById('hledatIC');
    const adresaInput = document.getElementById('adresa');
    const adresaSuggestions = document.getElementById('adresaSuggestions');

    if (!btnDomacnost || !btnFirma || !firmaPole || !icInput || !hledatICBtn || !adresaInput || !adresaSuggestions) {
        console.error('Některé elementy nebyly nalezeny');
        return;
    }

    btnDomacnost.addEventListener('click', function() {
        firmaPole.classList.add('hidden');
        icInput.removeAttribute('required');
        btnDomacnost.classList.remove('bg-gray-300', 'text-gray-700');
        btnDomacnost.classList.add('bg-blue-500', 'text-white');
        btnFirma.classList.remove('bg-blue-500', 'text-white');
        btnFirma.classList.add('bg-gray-300', 'text-gray-700');
    });

    btnFirma.addEventListener('click', function() {
        firmaPole.classList.remove('hidden');
        icInput.setAttribute('required', '');
        btnFirma.classList.remove('bg-gray-300', 'text-gray-700');
        btnFirma.classList.add('bg-blue-500', 'text-white');
        btnDomacnost.classList.remove('bg-blue-500', 'text-white');
        btnDomacnost.classList.add('bg-gray-300', 'text-gray-700');
    });

    hledatICBtn.addEventListener('click', function() {
        const ic = icInput.value;
        if (ic) {
            hledatFirmu(ic);
        }
    });

    // Inicializace Mapy.cz
    if (typeof Loader !== 'undefined') {
        Loader.load(null, null, function() {
            console.log('Mapy.cz loaded');
            initAddressSuggestions();
        });
    } else {
        console.error('Loader for Mapy.cz not found');
    }
}

async function hledatFirmu(ic) {
    try {
        const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ic}`);
        if (!response.ok) {
            throw new Error('Firma nebyla nalezena');
        }
        const data = await response.json();
        
        document.getElementById('jmeno').value = data.obchodniJmeno || '';
        document.getElementById('adresa').value = `${data.sidlo.ulice} ${data.sidlo.cisloDomovni}, ${data.sidlo.obec}, ${data.sidlo.psc}`;
        
        alert('Údaje firmy byly úspěšně načteny');
    } catch (error) {
        console.error('Chyba při hledání firmy:', error);
        alert('Nepodařilo se načíst údaje firmy. Zkontrolujte IČ a zkuste to znovu.');
    }
}

function initAddressSuggestions() {
    const adresaInput = document.getElementById('adresa');
    const adresaSuggestions = document.getElementById('adresaSuggestions');
    let suggestionTimeout;

    adresaInput.addEventListener('input', function() {
        clearTimeout(suggestionTimeout);
        suggestionTimeout = setTimeout(() => {
            const query = this.value;
            if (query.length > 2) {
                SMap.Suggest.get({
                    phrase: query,
                    count: 5,
                    bounds: "48.5370786,12.0921668|51.0746358,18.8927040",
                    type: "street"
                }, function(suggestions) {
                    adresaSuggestions.innerHTML = '';
                    if (suggestions.length > 0) {
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = item.text;
                            div.classList.add('p-2', 'hover:bg-gray-100', 'cursor-pointer');
                            div.addEventListener('click', function() {
                                adresaInput.value = item.text;
                                adresaSuggestions.classList.add('hidden');
                            });
                            adresaSuggestions.appendChild(div);
                        });
                        adresaSuggestions.classList.remove('hidden');
                    } else {
                        adresaSuggestions.classList.add('hidden');
                    }
                });
            } else {
                adresaSuggestions.classList.add('hidden');
            }
        }, 300);
    });

    document.addEventListener('click', function(e) {
        if (e.target !== adresaInput && e.target !== adresaSuggestions) {
            adresaSuggestions.classList.add('hidden');
        }
    });
}