const API_BASE_URL = 'https://api.invoicing.co/api/v1';
const API_KEY_NJ = 'zkqqUnm4u1I6RM22Klkf731Y668SWVkry1RrU5q8i2i32lcdlcEx4Tr9r7txCjud';

const ECOMAIL_API_KEY = '1a01940cbe7689a1725cc0f5f4d3cb02eb5509e8acba75f7cd0e9d411cf1a912'; // Nahraďte svým skutečným Ecomail API klíčem
const ECOMAIL_LIST_ID = 'test'; // Nahraďte ID svého Ecomail listu
async function createOrGetClient(clientData) {
  try {
    const searchResponse = await fetch(`${API_BASE_URL}/clients?email=${clientData.email}`, {
      headers: {
        'X-Api-Token': API_KEY_NJ,
        'Content-Type': 'application/json'
      }
    });
    const searchResult = await searchResponse.json();

    if (searchResult.data.length > 0) {
      return searchResult.data[0];
    } else {
      const createResponse = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'X-Api-Token': API_KEY_NJ,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${clientData.jmeno} ${clientData.lastname}`,
          contacts: [{
            email: clientData.email,
            phone: clientData.phone
          }],
          address1: clientData.adresa,
          number: clientData.customerType === 'firma' ? clientData.ic : ''
        })
      });
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error in createOrGetClient:', error);
    throw error;
  }
}

async function createProject(projectData) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'X-Api-Token': API_KEY_NJ,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Oprava - ${projectData.popisProblemu.substring(0, 50)}...`,
        client_id: projectData.clientId,
        task_rate: 0,
        budgeted_hours: 0,
        is_deleted: false,
        color: "blue"
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
}

async function createTask(taskData) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'X-Api-Token': API_KEY_NJ,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: taskData.popisProblemu,
        project_id: taskData.projectId,
        time_log: `${taskData.datumTerminu} ${taskData.casoveOkno}`
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error in createTask:', error);
    throw error;
  }
}

async function processCustomerRequest(formData) {
  try {
    const client = await createOrGetClient(formData);
    const project = await createProject({
      popisProblemu: formData.popisProblemu,
      clientId: client.id
    });
    const task = await createTask({
      popisProblemu: formData.popisProblemu,
      projectId: project.id,
      datumTerminu: formData.datumTerminu,
      casoveOkno: formData.casoveOkno
    });

    // Přidáme uživatele do Ecomail listu
    await addUserToEcomailList(formData);

    // Uložíme data do naší databáze
    const response = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Chyba při ukládání do databáze');
    }

    console.log("Request processed successfully");

    return {
      client: client,
      project: project,
      task: task
    };
  } catch (error) {
    console.error('Error in processCustomerRequest:', error);
    throw error;
  }
}

async function addUserToEcomailList(userData) {
  try {
    const response = await fetch(`https://api2.ecomailapp.cz/lists/${ECOMAIL_LIST_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': ECOMAIL_API_KEY
      },
      body: JSON.stringify({
        subscriber_data: {
          email: userData.email,
          name: userData.jmeno,
          surname: userData.lastname,
          phone: userData.phone,
        },
        resubscribe: true,
        update_existing: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('User added to Ecomail list:', result);
    return result;
  } catch (error) {
    console.error('Error adding user to Ecomail list:', error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const customerForm = document.getElementById('customerForm');
  const firmaPole = document.getElementById('firmaPole');
  const customerInfoSection = document.getElementById('customerInfoSection');
  const termsSection = document.getElementById('termsSection');
  const showTermsButton = document.getElementById('showTermsButton');
  const backButton = document.getElementById('backButton');
  const confirmButton = document.getElementById('confirmButton');
  const orderConfirmation = document.getElementById('orderConfirmation');

  // Show/hide company field based on customer type
  document.querySelectorAll('input[name="customerType"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'firma') {
        firmaPole.classList.remove('hidden');
      } else {
        firmaPole.classList.add('hidden');
      }
    });
  });

  // Show terms section
  showTermsButton.addEventListener('click', () => {
    customerInfoSection.classList.add('hidden');
    termsSection.classList.remove('hidden');
  });

  // Go back to customer info section
  backButton.addEventListener('click', () => {
    termsSection.classList.add('hidden');
    customerInfoSection.classList.remove('hidden');
  });

  // Enable/disable confirm button based on terms acceptance
  const termsCheckboxes = document.querySelectorAll('input[name="terms"]');
  termsCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(termsCheckboxes).every(cb => cb.checked);
      confirmButton.disabled = !allChecked;
    });
  });

  customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataObject = Object.fromEntries(formData.entries());

    try {
      const result = await processCustomerRequest(formDataObject);
      console.log('Request processed successfully:', result);
      // Show order confirmation
      termsSection.classList.add('hidden');
      orderConfirmation.classList.remove('hidden');
      // You can populate orderSummary here if needed
      document.getElementById('orderSummary').textContent = 'Vaše objednávka byla úspěšně zpracována.';
    } catch (error) {
      console.error('Failed to process request:', error);
      alert('Došlo k chybě při zpracování požadavku. Zkuste to prosím znovu.');
    }
  });
});