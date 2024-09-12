// Invoice Ninja API integration
const API_BASE_URL = 'https://api.invoicing.co/api/v1';
const API_KEY_NJ = 'zkqqUnm4u1I6RM22Klkf731Y668SWVkry1RrU5q8i2i32lcdlcEx4Tr9r7txCjud';

async function createOrGetClient(clientData) {
  try {
    // Check if client exists
    const searchResponse = await fetch(`${API_BASE_URL}/clients?email=${clientData.email}`, {
      headers: {
        'X-Api-Token': API_KEY_NJ,
        'Content-Type': 'application/json'
      }
    });
    const searchResult = await searchResponse.json();

    if (searchResult.data.length > 0) {
      // Client exists, return the first match
      return searchResult.data[0];
    } else {
      // Create new client
      const createResponse = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'X-Api-Token': API_KEY_NJ,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
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
      body: JSON.stringify(projectData)
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
      body: JSON.stringify(taskData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error in createTask:', error);
    throw error;
  }
}

async function processCustomerRequest(formData) {
  try {
    // 1. Create or get client
    const clientData = {
      name: `${formData.jmeno} ${formData.prijmeni}`,
      email: formData.email,
      phone: formData.telefon,
      address1: formData.adresa
    };
    const client = await createOrGetClient(clientData);

    // 2. Create project
    const projectData = {
      client_id: client.id,
      name: `IT Support - ${new Date().toISOString().split('T')[0]}`,
      description: formData.popisProblemu
    };
    const project = await createProject(projectData);

    // 3. Create task
    const taskData = {
      project_id: project.id,
      description: formData.popisProblemu,
      time_log: '1:00:00', // Placeholder time log
      date: formData.datumTerminu,
      custom_value1: formData.casoveOkno
    };
    const task = await createTask(taskData);

    return {
      client: client,
      project: project,
      task: task
    };
  } catch (error) {
    console.error('Error in CustomerRequest:', error);
    throw error;
  }
}

// Usage in your form submission handler
document.getElementById('customerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formDataObject = Object.fromEntries(formData.entries());

  try {
    const result = await processCustomerRequest(formDataObject);
    console.log('Request processed successfully:', result);
    // Handle successful submission (e.g., show confirmation, redirect)
  } catch (error) {
    console.error('Failed to process request:', error);
    // Handle error (e.g., show error message to user)
  }
});