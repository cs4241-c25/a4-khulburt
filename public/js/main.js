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
    updateTable(updatedData);

    document.querySelector("#restaurantForm").reset();
}

const clearData = async function(event) {
    event.preventDefault();

    try {
        const response = await fetch("/clear", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to clear data");

        // Clear the table after clearing data
        updateTable([]);
    } catch (error) {
        console.error("Error:", error);
    }
};

const fetchData = async function() {
    try {
        const response = await fetch("/getData", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        updateTable(data);
    } catch (error) {
        console.error("Error:", error);
    }
};

const updateTable = function(data) {
    const tableBody = document.getElementById("reviewTableBody");
    tableBody.innerHTML = "";

    data.forEach(item => {
        const row = document.createElement("tr");

        const returnValue = item.rating > 5 ? "Yes" : "No";

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
};

window.onload = function() {
    console.log("Page Loaded");

    // Load existing data when the page loads
    fetchData();

    const form = document.querySelector("#restaurantForm");
    form.addEventListener("submit", submit);

    const clearButton = document.getElementById("clearButton");
    clearButton.addEventListener("click", clearData);

    const refreshButton = document.getElementById("refreshButton");
    refreshButton.addEventListener("click", fetchData);
};

