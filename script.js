document.addEventListener('DOMContentLoaded', function() {
    const inputsContainer = document.querySelector('.inputs-container');

    // Function to create a new input box
    function createInputBox() {
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('category-input');
        input.placeholder = 'Add a category';
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

    // Initial input box setup
    createInputBox();
});
