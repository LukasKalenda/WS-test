const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { ic } = event.queryStringParameters;
  if (!ic) {
    return { statusCode: 400, body: 'Missing IC parameter' };
  }

  try {
    const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ic}`);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}