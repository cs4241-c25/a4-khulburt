// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    // Collect values from the form fields
    const inputName = document.querySelector("#name").value;
    const inputFoodType = document.querySelector("#foodtype").value;
    const inputDate = document.querySelector("#date").value;
    const inputRating = document.querySelector("#rating").value;
    const inputReview = document.querySelector("#review").value;

    const json = {
        name: inputName,
        foodtype: inputFoodType,
        date: inputDate,
        rating: inputRating,
        review: inputReview
    };

    const body = JSON.stringify(json);

    const response = await fetch( "/submit", {
        method:'POST',
        body: body,
        headers: {
            "Content-Type": "application/json"
        }
    })

    const updatedData = await response.json();

    const tableBody = document.getElementById("reviewTableBody");
    tableBody.innerHTML = '';

    updatedData.forEach(item => {
        const row = document.createElement("tr");

        const returnValue = item.rating > 5 ? "Yes" : "No";  // Set "Yes" if rating > 5, else "No"

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.foodtype}</td>
            <td>${item.date}</td>
            <td>${item.rating}</td>
            <td>${item.review}</td>
            <td>${returnValue}</td>
        `;
        tableBody.appendChild(row);
    });
}

const clearData = async function(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    // Send a request to clear the data on the server
    const response = await fetch("/clear", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    });

    // Get the response (which should be the empty array)
    const updatedData = await response.json();

    // Clear the table
    const tableBody = document.getElementById("reviewTableBody");
    tableBody.innerHTML = '';

}

window.onload = function() {
    console.log('Page Loaded');

    const form = document.querySelector("#restaurantForm");
    form.addEventListener('submit', submit);

    const clearButton = document.getElementById("clearButton");
    clearButton.addEventListener('click', clearData);




}