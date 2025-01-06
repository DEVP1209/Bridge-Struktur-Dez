async function getFilters() {
    try {
        const response = await fetch('https://bildzeitschrift.netlify.app/.netlify/functions/filters');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data["1 NEU"]["BEWERTUNG"]["values"]);
        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

getFilters();