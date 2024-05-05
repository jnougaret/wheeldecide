// Reference to your database location
const listsRef = firebase.database().ref('lists');
const inputsContainer = document.querySelector('.inputs-container');

function selectRandomCategory() {
    const nonEmptyCategories = Array.from(document.querySelectorAll('.category-input')).filter(input => input.value !== '');
    const randomIndex = Math.floor(Math.random() * nonEmptyCategories.length);
    return nonEmptyCategories[randomIndex];
}

function updatePieChart(highlightIndex = null) {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const categories = Array.from(document.querySelectorAll('.category-input')).filter(input => input.value !== '');
    const numCategories = categories.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10; // Subtract a bit for border

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    if (numCategories === 0) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 0, 360);
        ctx.closePath();
        ctx.fill();
        return;
    }

    let startAngle = 0;
    const anglePerCategory = (2 * Math.PI) / numCategories;

    categories.forEach((category, index) => {
        const endAngle = startAngle + anglePerCategory;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = category.style.borderColor;
        if (index === highlightIndex) {
            ctx.fillStyle = 'gold';  // Change the fill style for highlight
        }
        ctx.fill();
        startAngle = endAngle;
    });
}

let availableColors = [
    "rgb(141, 211, 199)", "rgb(255, 255, 179)", "rgb(190, 186, 218)",
    "rgb(251, 128, 114)", "rgb(128, 177, 211)", "rgb(253, 180, 98)",
    "rgb(179, 222, 105)", "rgb(252, 205, 229)", "rgb(217, 217, 217)",
    "rgb(188, 128, 189)", "rgb(204, 235, 197)", "rgb(255, 237, 111)"
];
let usedColors = [];

function resetColors() {
    availableColors = [
        "rgb(141, 211, 199)", "rgb(255, 255, 179)", "rgb(190, 186, 218)",
        "rgb(251, 128, 114)", "rgb(128, 177, 211)", "rgb(253, 180, 98)",
        "rgb(179, 222, 105)", "rgb(252, 205, 229)", "rgb(217, 217, 217)",
        "rgb(188, 128, 189)", "rgb(204, 235, 197)", "rgb(255, 237, 111)"
    ];
    usedColors = [];
}

let lastSelectedCategory = null;  // Store both element and original color

function spinWheel() {
    // Reset the style of the previously selected category
    if (lastSelectedCategory) {
        lastSelectedCategory.element.style.fontWeight = 'normal';
        lastSelectedCategory.element.style.borderColor = lastSelectedCategory.originalColor;
    }

    const categories = Array.from(document.querySelectorAll('.category-input')).filter(input => input.value !== '');
    const selectedCategory = selectRandomCategory();
    const index = categories.indexOf(selectedCategory);
    const numCategories = categories.length;
    const totalSpins = numCategories * 2;  // Ensure at least two full spins
    let currentHighlight = 0;
    let spinsCompleted = 0;
    let interval = 50;

    const timer = setInterval(() => {
        updatePieChart(currentHighlight);
        currentHighlight = (currentHighlight + 1) % numCategories;
        if (currentHighlight === 0) spinsCompleted++;  // Increment full spin count when a full cycle is completed

        // Slow down the animation as it progresses
        if (spinsCompleted >= 2 && currentHighlight === index) {
            clearInterval(timer);
            updatePieChart(index);  // Highlight the final category
            selectedCategory.style.fontWeight = 'bold';  // Make the font weight bold
            const originalColor = selectedCategory.style.borderColor;
            selectedCategory.style.borderColor = 'gold';  // Change border to gold
            lastSelectedCategory = { element: selectedCategory, originalColor: originalColor };  // Store the last selected
        } else {
            if (interval < 500) interval += 10;
        }
    }, interval);
}

function getColor() {
    if (availableColors.length > 0) {
        const color = availableColors.shift(); // Remove the first color from available and use it
        usedColors.push(color);
        return color;
    }
    return "rgb(0,0,0)"; // Fallback color if more than 12 inputs
}

// Call updatePieChart whenever the UI needs updating
document.querySelectorAll('.category-input').forEach(input => {
    input.addEventListener('input', function() {
        setColorForInput(input);
        updatePieChart();  // Ensure pie chart updates are also handled
    });
    input.addEventListener('blur', function() {
        setColorForInput(input);
        updatePieChart();  // Update the pie chart on blur to handle empty input removal
    });
});

// Handle input event on any input box
function handleInput(event) {
    const allInputs = Array.from(document.querySelectorAll('.category-input'));
    const lastInput = allInputs[allInputs.length - 1];
    if (event.target === lastInput && event.target.value !== '' && allInputs.length < 12) {
        lastInput.removeEventListener('input', handleInput);
        createInputBox(); // Create a new input box only if there are less than 12
    }
    setColorForInput(event.target);
    updatePieChart();
}

function setColorForInput(input) {
    if (input.value !== '') {
        if (!input.style.borderColor || input.style.borderColor === 'rgb(0, 0, 0)') {
            if (availableColors.length > 0) {
                const color = availableColors.shift();  // Get a new color from the pool
                usedColors.push(color);
                input.style.borderColor = color;
            } else {
                input.style.borderColor = 'rgb(0, 0, 0)'; // Use fallback color if no colors are left
            }
        }
    } else {
        if (input.style.borderColor && input.style.borderColor !== 'rgb(0, 0, 0)') {
            availableColors.push(input.style.borderColor);  // Return the color if the input is cleared
            usedColors = usedColors.filter(c => c !== input.style.borderColor);
            input.style.borderColor = '';
        }
    }
}

function handleBlur(event) {
    const input = event.target;
    const allInputs = Array.from(document.querySelectorAll('.category-input'));
    const lastInput = allInputs[allInputs.length - 1];

    if (input.value === '' && input !== lastInput) {
        const color = input.style.borderColor;
        usedColors = usedColors.filter(c => c !== color);
        availableColors.push(color);
        input.removeEventListener('input', handleInput);
        input.removeEventListener('blur', handleBlur);
        input.remove();
        updatePieChart();
    }
}

function createInputBox() {
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('category-input');
    input.placeholder = 'Add a category';
    input.name = 'categoryName[]';
    input.addEventListener('input', handleInput);
    input.addEventListener('blur', handleBlur);
    inputsContainer.appendChild(input);
    setColorForInput(input); // Optionally set color on creation
}

function gatherDataFromUI() {
    const categories = document.querySelectorAll('.category-input');
    const data = Array.from(categories).map(input => input.value.trim()).filter(value => value !== '');
    return data;
}

function saveCurrentList() {
    const listName = document.getElementById('listName').value;  // Get the list name inside the function
    if (!listName.trim()) {
        console.log("No list name provided.");
        return;  // Prevent saving if list name is empty
    }

    listsRef.child(listName).once('value', snapshot => {
        if (snapshot.exists()) {
            console.log("List name already exists and was not saved.");  // Log if the list already exists
        } else {
            const data = gatherDataFromUI();  // Gather data from the UI
            if (data.length === 0) {
                console.log("No data to save.");
                return;  // Prevent saving if there is no data
            }
            listsRef.child(listName).set(data).then(() => {
                console.log("List was successfully saved.");  // Log on successful save
            }).catch(error => {
                console.error("Error saving list:", error);  // Log any errors during save
            });
        }
    });
}

function displayDataOnUI(data) {
    inputsContainer.innerHTML = ''; // Clear existing inputs
    
    data.forEach(item => {
        createInputBox(); // Create a new input box for each item
        const lastInput = inputsContainer.lastElementChild; // Get the newly created input box
        lastInput.value = item; // Set the value of the new input box
        setColorForInput(lastInput); // Apply color based on the content
        updatePieChart();
    });

    createInputBox(); // Add an empty box at the end for new entries
}

function loadSelectedList() {
    const listName = document.getElementById('listName').value;  // Get the list name inside the function
    if (!listName.trim()) {
        console.log("No list name provided for loading.");
        return;  // Prevent loading if no list name is provided
    }
    resetColors();
    listsRef.child(listName).once('value', snapshot => {
        const data = snapshot.val();
        if (data === null) {
            console.log("No data found for the list name: " + listName);
            return;  // Early return if no data found
        }
        displayDataOnUI(data);  // Call displayDataOnUI to update the UI with loaded data
        console.log("List successfully loaded.");  // Log successful loading of the list
    });
}

function deleteSelectedList() {
    const listName = document.getElementById('listName').value;  // Get the list name inside the function
    if (!listName.trim()) {
        console.log("No list name provided for deletion.");
        return;  // Prevent deletion if no list name is provided
    }
    listsRef.child(listName).once('value', snapshot => {
        const data = snapshot.val();
        if (data !== null) {
            listsRef.child(listName).remove()
                .then(() => console.log("List deleted successfully."))
                .catch((error) => console.error("Error deleting list: ", error));
        } else {
            console.log("No list found with the name: " + listName);
        }
    });
}

function initializeInputs() {
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelector('#saveButton').addEventListener('click', saveCurrentList);
        document.querySelector('#loadButton').addEventListener('click', loadSelectedList);
        document.querySelector('#deleteButton').addEventListener('click', deleteSelectedList);

        // Initial input box setup
        createInputBox();
        updatePieChart();
    });
}

// Call initializeInputs to set everything up
initializeInputs();
