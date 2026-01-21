export const fetchColors = async () => {
    const response = await fetch('https://api.example.com/colors');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
};