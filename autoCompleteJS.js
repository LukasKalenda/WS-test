const API_KEY = '9XaTSz3fWU_yHEXdZpBT9O0CjTUlfvn7fO8iGEVGaT8';
const inputElem = document.querySelector("#autoComplete");

// Počkáme, až se DOM načte
document.addEventListener("DOMContentLoaded", function() {
    const autoCompleteJS = new autoComplete({
        selector: "#autoComplete",
        placeHolder: "Zadejte vaši adresu...",
        data: {
            src: async (query) => {
                try {
                    const response = await fetch(`https://api.mapy.cz/v1/suggest?lang=cs&limit=5&type=regional.address&apikey=${API_KEY}&query=${query}`);
                    const data = await response.json();
                    return data.items;
                } catch (error) {
                    console.error("Error fetching data:", error);
                    return [];
                }
            },
            keys: ["name"],
        },
        resultItem: {
            highlight: true,
            element: (item, data) => {
                item.innerHTML = `
                    <div style="display: flex; flex-direction: column;">
                        <div>${data.match}</div>
                        <div style="font-size: 0.8em; color: #777;">${data.value.label}, ${data.value.location}</div>
                    </div>
                `;
            },
        },
        resultsList: {
            element: (list, data) => {
                if (!data.results.length) {
                    const message = document.createElement("div");
                    message.setAttribute("class", "no_result");
                    message.innerHTML = `<span>Nenalezeny žádné výsledky pro "${data.query}"</span>`;
                    list.prepend(message);
                }

                const logoHolder = document.createElement("div");
                logoHolder.style = "padding: 5px; display: flex; align-items: center; justify-content: flex-end; gap: 5px; font-size: 12px;";
                logoHolder.innerHTML = `
                    <span>Powered by</span>
                    <img src="https://api.mapy.cz/img/api/logo-small.svg" style="width: 60px" alt="Mapy.cz">
                `;
                list.append(logoHolder);
            },
            noResults: true,
        },
        events: {
            input: {
                selection: (event) => {
                    const selection = event.detail.selection.value;
                    inputElem.value = selection.name;
                    console.log(selection);
                }
            }
        }
    });
});