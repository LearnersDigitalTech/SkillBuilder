
const BASE_URL = 'http://localhost:3000/api/health';

fetch(BASE_URL)
    .then(async res => {
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Data:", data);
        } else {
            console.error("Error Text:", await res.text());
        }
    })
    .catch(err => console.error("Fetch Error:", err));
