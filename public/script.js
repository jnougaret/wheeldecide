// Reference to your database location
const listsRef = firebase.database().ref('lists');
const inputsContainer = document.querySelector('.inputs-container');

// Handle input event on any input box
function handleInput(event) {
    const allInputs = Array.from(document.querySelectorAll('.category-input'));
    const lastInput = allInputs[allInputs.length - 1];
    if (event.target === lastInput && event.target.value !== '') {
        // Remove the event listener from the current last input
        lastInput.removeEventListener('input', handleInput);
        // Create a new input box
        createInputBox();
    }
}

// Handle blur event to potentially remove input box
function handleBlur(event) {
    if (event.target.value === '') {
        const allInputs = Array.from(document.querySelectorAll('.category-input'));
        if (allInputs.length > 2) {
            event.target.removeEventListener('blur', handleBlur);
            event.target.remove();
        }
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
    });

    createInputBox(); // Add an empty box at the end for new entries
}

function loadSelectedList() {
    const listName = document.getElementById('listName').value;  // Get the list name inside the function
    if (!listName.trim()) {
        console.log("No list name provided for loading.");
        return;  // Prevent loading if no list name is provided
    }
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
    });
}

// Call initializeInputs to set everything up
initializeInputs();
