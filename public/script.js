document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired');
  initializeComponents();
});

function initializeComponents() {
  console.log('Initializing components');

  const btnDomacnost = document.getElementById('btnDomacnost');
  const btnFirma = document.getElementById('btnFirma');
  const firmaPole = document.getElementById('firmaPole');
  const nazevSpolecnostiPole = document.getElementById('nazevSpolecnostiPole');
  const dicPole = document.getElementById('dicPole');
  const icInput = document.getElementById('ic');
  const hledatICBtn = document.getElementById('hledatIC');
  const adresaInput = document.getElementById('adresa');
  const adresaSuggestions = document.getElementById('adresaSuggestions');
  const casSelect = document.getElementById('cas');

  if (!btnDomacnost || !btnFirma || !firmaPole || !nazevSpolecnostiPole || !dicPole || !icInput || !hledatICBtn || !adresaInput || !adresaSuggestions || !casSelect) {
      console.error('Některé elementy nebyly nalezeny');
      return;
  }

  btnDomacnost.addEventListener('click', function() {
      firmaPole.classList.add('hidden');
      nazevSpolecnostiPole.classList.add('hidden');
      dicPole.classList.add('hidden');
      icInput.removeAttribute('required');
      btnDomacnost.classList.remove('bg-gray-300', 'text-gray-700');
      btnDomacnost.classList.add('bg-blue-500', 'text-white');
      btnFirma.classList.remove('bg-blue-500', 'text-white');
      btnFirma.classList.add('bg-gray-300', 'text-gray-700');
  });

  btnFirma.addEventListener('click', function() {
      firmaPole.classList.remove('hidden');
      nazevSpolecnostiPole.classList.remove('hidden');
      dicPole.classList.remove('hidden');
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

  casSelect.addEventListener('change', function() {
      const warningElement = document.getElementById('evening-warning');
      if (this.value === '18:00-20:00' || this.value === '20:00-23:59') {
          warningElement.textContent = "Práce ve večerních a nočních hodinách jsou účtovány vyšší hodinovou sazbou dle ceníku.";
          warningElement.classList.remove('hidden');
      } else {
          warningElement.classList.add('hidden');
      }
  });
}

async function hledatFirmu(ic) {
  console.log('Hledání firmy s IČ:', ic);
  try {
      const response = await fetch(`/.netlify/functions/ares-proxy?ic=${ic}`);
      console.log('ARES proxy response status:', response.status);
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Firma nebyla nalezena');
      }
      const data = await response.json();
      console.log('ARES data:', data);
      
      if (data.error) {
          throw new Error(data.error);
      }
      
      document.getElementById('nazevSpolecnosti').value = data.obchodniJmeno || '';
      document.getElementById('adresa').value = `${data.sidlo.ulice} ${data.sidlo.cisloDomovni}, ${data.sidlo.obec}, ${data.sidlo.psc}`;
      document.getElementById('dic').value = data.dic || 'Není plátce DPH';
      
      alert('Údaje firmy byly úspěšně načteny');
  } catch (error) {
      console.error('Chyba při hledání firmy:', error);
      alert(`Nepodařilo se načíst údaje firmy: ${error.message}`);
  }
}

function initAddressSuggestions() {
  console.log('Initializing address suggestions');
  if (typeof SMap === 'undefined' || typeof SMap.Suggest === 'undefined') {
      console.error('SMap or SMap.Suggest is not defined');
      return;
  }

  const adresaInput = document.getElementById('adresa');
  const adresaSuggestions = document.getElementById('adresaSuggestions');
  let suggestionTimeout;

  adresaInput.addEventListener('input', function() {
      clearTimeout(suggestionTimeout);
      suggestionTimeout = setTimeout(() => {
          const query = this.value;
          if (query.length > 2) {
              new SMap.Suggest(adresaInput, {
                  provider: new SMap.SuggestProvider({
                      userData: {"lang": "cs", "locality": ""},
                      bounds: "48.5370786,12.0921668|51.0746358,18.8927040"
                  }),
                  size: 5
              }).addListener("suggest", function(suggestData) {
                  adresaSuggestions.innerHTML = '';
                  if (suggestData.length > 0) {
                      suggestData.forEach(item => {
                          const div = document.createElement('div');
                          div.textContent = item.phrase;
                          div.classList.add('p-2', 'hover:bg-gray-100', 'cursor-pointer');
                          div.addEventListener('click', function() {
                              adresaInput.value = item.phrase;
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
// Kontrola, zda je Mapy.cz API načteno a inicializace našeptávání adres
function checkAndInitMaps() {
  if (typeof SMap !== 'undefined' && typeof SMap.Suggest !== 'undefined') {
      console.log('SMap and SMap.Suggest are defined, initializing address suggestions');
      initAddressSuggestions();
  } else {
      console.log('SMap or SMap.Suggest is not defined, waiting...');
      setTimeout(checkAndInitMaps, 100);
  }
}

// Spuštění kontroly po načtení DOMContentLoaded
document.addEventListener('DOMContentLoaded', checkAndInitMaps);