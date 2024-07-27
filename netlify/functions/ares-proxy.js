const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log('ARES proxy function called');
  const { ic } = event.queryStringParameters;
  if (!ic) {
    return { statusCode: 400, body: 'Missing IC parameter' };
  }

  try {
    const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ic}`);
    const data = await response.json();
    console.log('ARES response:', data);
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('ARES proxy error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}