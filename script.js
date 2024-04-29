document.addEventListener('DOMContentLoaded', function() {
    const inputsContainer = document.querySelector('.inputs-container');

    function createInputBox() {
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('category-input');
        input.placeholder = 'Add a category';
        inputsContainer.appendChild(input);
        input.addEventListener('input', handleInput);
        input.addEventListener('blur', handleBlur);
    }

    function handleInput(event) {
        const allInputs = Array.from(inputsContainer.querySelectorAll('.category-input'));
        const lastInput = allInputs[allInputs.length - 1];
        // Ensure a new input is created only if it's the last input and there's text
        if (event.target === lastInput && event.target.value.trim() && !lastInput.nextElementSibling) {
            createInputBox();
        }
    }

    function handleBlur(event) {
        if (event.target.value.trim() === '') {
            // Allow removal only if there is more than one input box
            if (inputsContainer.children.length > 1) {
                event.target.remove();
            }
        }
    }

    // Start with a single input box
    createInputBox();
});
