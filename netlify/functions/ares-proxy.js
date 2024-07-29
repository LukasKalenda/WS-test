const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log('API Proxy function called with event:', JSON.stringify(event));

  const { path } = event.queryStringParameters;

  if (path === 'ares') {
    const { ic } = event.queryStringParameters;
    if (!ic) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Chybí IČ' }) };
    }
    try {
      const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ic}`);
      const data = await response.json();
      console.log('ARES API response:', data);
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      console.error('Error fetching ARES data:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Chyba při získávání dat z ARES' }) };
    }
  } else if (path === 'mapy') {
    const { query } = event.queryStringParameters;
    if (!query) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Chybí dotaz' }) };
    }
    try {
      const url = `https://api.mapy.cz/v1/suggest?apiKey=9XaTSz3fWU_yHEXdZpBT9O0Cj&query=${encodeURIComponent(query)}&type=street&limit=5&bounds=48.5370786,12.0921668|51.0746358,18.8927040`;
      console.log('Fetching Mapy.cz API:', url);
      const response = await fetch(url);
      const text = await response.text();
      console.log('Mapy.cz API raw response:', text);
      const data = JSON.parse(text);
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      console.error('Error fetching Mapy.cz data:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Chyba při získávání dat z Mapy.cz' }) };
    }
  } else {
    console.log('Invalid path requested:', path);
    return { statusCode: 400, body: JSON.stringify({ error: 'Neplatná cesta' }) };
  }
};