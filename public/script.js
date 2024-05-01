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

export function initializeInputs() {
    document.addEventListener('DOMContentLoaded', function() {
        const inputsContainer = document.querySelector('.inputs-container');

        document.querySelector('#saveButton').addEventListener('click', saveCurrentList);
        document.querySelector('#loadButton').addEventListener('click', loadSelectedList);
        document.querySelector('#deleteButton').addEventListener('click', deleteSelectedList);

        // Reference to your database location
        const listsRef = firebase.database().ref('lists');

        // Save data
        function saveCurrentList() {
            const listName = document.getElementById('listName').value;  // Get the list name inside the function
            const data = gatherDataFromUI();  // Gather data is also called inside the function
            listsRef.child(listName).set(data);
        }

        // Load data
        function loadSelectedList() {
            const listName = document.getElementById('listName').value;  // Get the list name inside the function
            listsRef.child(listName).once('value', snapshot => {
                const data = snapshot.val();
                displayDataOnUI(data);  // Call displayDataOnUI to update the UI with loaded data
            });
        }

        // Delete data
        function deleteSelectedList() {
            const listName = document.getElementById('listName').value;  // Get the list name inside the function
            listsRef.child(listName).remove();
        }
 
        // Initial input box setup
        createInputBox();
    });
}

export function gatherDataFromUI() {
            const categories = document.querySelectorAll('.category-input');
            const data = Array.from(categories).map(input => input.value.trim()).filter(value => value !== '');
            return data;
}

export function displayDataOnUI(data) {
    const inputsContainer = document.querySelector('.inputs-container');
    inputsContainer.innerHTML = ''; // Clear existing inputs
    data.forEach(item => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item;
        input.classList.add('category-input');
        inputsContainer.appendChild(input);
    });
    createInputBox(); // Assuming you have this function to add an empty box at the end
}
