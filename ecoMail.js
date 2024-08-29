// Funkce pro vytvoření nového listu
async function createEcomailList() {
    const apiKey = '1a01940cbe7689a1725cc0f5f4d3cb02eb5509e8acba75f7cd0e9d411cf1a912';
    const url = 'https://api2.ecomailapp.cz/lists';

    const data = {
        name: 'Dev list',
        from_name: 'Lukas Test',
        from_email: 'lukas.kalenda@email.cz',
        reply_to: 'lukaskalenda04@gmail.com'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.status === 201) {
            const resultEcoMail = await response.json();
            console.log('List byl úspěšně vytvořen!');
            console.log('ID nového listu:', resultEcoMail.id);
            document.getElementById('resultEcoMail').textContent = `List byl úspěšně vytvořen! ID: ${resultEcoMail.id}`;
        } else {
            console.error('Chyba při vytváření listu:', response.status);
            document.getElementById('resultEcoMail').textContent = `Chyba při vytváření listu: ${response.status}`;
        }
    } catch (error) {
        console.error('Chyba:', error);
        document.getElementById('resultEcoMail').textContent = `Chyba: ${error.message}`;
    }
}