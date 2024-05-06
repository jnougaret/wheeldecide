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
        // Draw a full pie chart using all 12 colors when no categories exist
        let startAngle = 0;
        const anglePerSlice = (2 * Math.PI) / availableColors.length;
        availableColors.forEach((color, index) => {
            const endAngle = startAngle + anglePerSlice;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            startAngle = endAngle;
        });
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
        lastSelectedCategory.element.style.borderWidth = '2px';
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
            // Update the display element with the selected category name
            document.getElementById('selectedCategoryDisplay').textContent = `${selectedCategory.value}`;
        } else {
            if (interval < 500) interval += 30;
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
    const currentInputs = document.querySelectorAll('.category-input');
    if (currentInputs.length >= 12) {
        // Do not create more input boxes if the limit is reached
        return;
    }

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
    const messageDisplay = document.getElementById('messageDisplay');
    const listName = document.getElementById('listName').value;  // Get the list name inside the function
    if (!listName.trim()) {
        messageDisplay.textContent = "No list name provided.";
        return;  // Prevent saving if list name is empty
    }

    listsRef.child(listName).once('value', snapshot => {
        if (snapshot.exists()) {
            messageDisplay.textContent = "List name already exists. Try another name.";
        } else {
            const data = gatherDataFromUI();  // Gather data from the UI
            if (data.length === 0) {
                messageDisplay.textContent = "No data to save.";
                return;  // Prevent saving if there is no data
            }
            listsRef.child(listName).set(data).then(() => {
                messageDisplay.textContent = "List was successfully saved.";
            }).catch(error => {
                messageDisplay.textContent = "Error saving list: " + error;
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
    const messageDisplay = document.getElementById('messageDisplay');
    const listName = document.getElementById('listName').value;
    if (!listName.trim()) {
        messageDisplay.textContent = "No list name provided for loading.";
        return;
    }

    listsRef.child(listName).once('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            displayDataOnUI(data);
            messageDisplay.textContent = "List loaded successfully.";
        } else {
            messageDisplay.textContent = "List not loaded. List name does not exist.";
        }
    });
}

function deleteSelectedList() {
    const messageDisplay = document.getElementById('messageDisplay');
    const listName = document.getElementById('listName').value;
    if (!listName.trim()) {
        messageDisplay.textContent = "No list name provided for deletion.";
        return;
    }

    listsRef.child(listName).once('value', snapshot => {
        if (snapshot.exists()) {
            listsRef.child(listName).remove().then(() => {
                messageDisplay.textContent = "List deleted successfully.";
            }).catch(error => {
                messageDisplay.textContent = "Error deleting list.";
            });
        } else {
            messageDisplay.textContent = "List not deleted. List name does not exist.";
        }
    });
}

function initializeInputs() {
    document.addEventListener('DOMContentLoaded', function () {
        // Ensure event listeners are attached to the new button IDs
        document.getElementById('saveButton').addEventListener('click', saveCurrentList);
        document.getElementById('loadButton').addEventListener('click', loadSelectedList);
        document.getElementById('deleteButton').addEventListener('click', deleteSelectedList);
        document.getElementById('spinButton').addEventListener('click', spinWheel);

        document.getElementById('listName').addEventListener('input', function() {
            var label = document.getElementById('inputLabel');
            if (this.value) {
                label.style.display = 'flex';  // Show label when there is text
            } else {
                label.style.display = 'none';  // Hide label when input is empty
            }
        });        

        // Initial input box setup
        createInputBox();  // Assuming this function creates the first empty input box
        updatePieChart();  // This should draw the initial state of the pie chart
    });
}

// Call initializeInputs to set everything up
initializeInputs();

window.addEventListener('load', function() {
    setTimeout(function() {
        document.body.style.padding = "10.1px";  // Slightly tweak a style property
        setTimeout(function() {
            document.body.style.padding = "10px";  // Reset it back
        }, 50);
    }, 50);
});
