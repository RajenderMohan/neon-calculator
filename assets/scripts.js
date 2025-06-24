tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'], // Keep Inter, but let's imagine a digital one for the display
            },
            colors: {
                'dark-bg': 'var(--main-bg-color)',
                'neon-blue': 'var(--neon-blue-color)',
                'neon-green': 'var(--neon-green-color)',
                'neon-pink': 'var(--neon-pink-color)',
                'carbon-dark': 'var(--carbon-dark-color)',
                'light-grey-text': 'var(--light-grey-text-color)',
                'error-red': 'var(--error-red-color)',
            }
        }
    }
}








 // Initialize a simple synth for button clicks
 const synth = new Tone.PolySynth(Tone.Synth).toDestination();
 let audioContextStarted = false; // Flag to ensure audio context starts only once

 // Function to play a click sound
 function playClickSound() {
     // Tone.js requires a user interaction to start its audio context
     if (!audioContextStarted) {
         Tone.start();
         audioContextStarted = true;
     }
     // Play a short note when a button is clicked
     synth.triggerAttackRelease("C5", "16n"); // Slightly higher pitch, shorter duration
 }

 class Calculator {
     constructor(previousOperandTextElement, currentOperandTextElement, historyEntriesElement) {
         this.previousOperandTextElement = previousOperandTextElement;
         this.currentOperandTextElement = currentOperandTextElement;
         this.historyEntriesElement = historyEntriesElement;
         this.history = []; // Array to store history entries
         this.clear();
     }

     clear() {
         this.currentOperand = '0';
         this.previousOperand = '';
         this.operation = undefined;
         this.currentOperandTextElement.classList.remove('error-shake', 'result-animate');
         this.deactivateAllOperators(); // Deactivate any active operator
     }

     delete() {
         if (this.currentOperand === 'Error') {
             this.clear();
             return;
         }
         this.currentOperand = this.currentOperand.toString().slice(0, -1);
         if (this.currentOperand === '') {
             this.currentOperand = '0';
         }
         this.currentOperandTextElement.classList.remove('error-shake', 'result-animate');
         this.deactivateAllOperators(); // Deactivate any active operator
     }

     appendNumber(number) {
         if (this.currentOperand === 'Error') {
             this.clear();
         }
         if (number === '.' && this.currentOperand.includes('.')) return;
         if (this.currentOperand === '0' && number !== '.') {
             this.currentOperand = number.toString();
         } else {
             this.currentOperand = this.currentOperand.toString() + number.toString();
         }
         this.currentOperandTextElement.classList.remove('error-shake', 'result-animate');
         this.deactivateAllOperators(); // Deactivate any active operator
     }

     deactivateAllOperators() {
         document.querySelectorAll('[data-operator]').forEach(btn => {
             btn.classList.remove('active-operator');
         });
     }

     activateOperator(buttonElement) {
         this.deactivateAllOperators();
         if (buttonElement) { // Ensure buttonElement exists before adding class
             buttonElement.classList.add('active-operator');
         }
     }

     chooseOperation(operation, buttonElement = null) {
         if (this.currentOperand === 'Error') return;
         if (this.currentOperand === '') return; // Allow changing operator if current operand is empty
         if (this.previousOperand !== '') {
             this.compute();
         }
         this.operation = operation;
         this.previousOperand = this.currentOperand;
         this.currentOperand = '';
         this.currentOperandTextElement.classList.remove('error-shake', 'result-animate');

         if (buttonElement) {
             this.activateOperator(buttonElement);
         }
     }

     compute() {
         let computation;
         const prev = parseFloat(this.previousOperand);
         const current = parseFloat(this.currentOperand);
         if (isNaN(prev) || isNaN(current)) return;

         const expression = `${this.getDisplayNumber(this.previousOperand)} ${this.operation} ${this.getDisplayNumber(this.currentOperand)}`;

         switch (this.operation) {
             case '+':
                 computation = prev + current;
                 break;
             case '-':
                 computation = prev - current;
                 break;
             case '*':
                 computation = prev * current;
                 break;
             case '/':
                 if (current === 0) {
                     computation = 'Error'; // Division by zero
                     this.currentOperandTextElement.classList.add('error-shake');
                     setTimeout(() => {
                         this.currentOperandTextElement.classList.remove('error-shake');
                     }, 1000);
                 } else {
                     computation = prev / current;
                 }
                 break;
             case '%':
                 computation = prev % current;
                 break;
             default:
                 return;
         }
         this.currentOperand = computation.toString();
         this.operation = undefined;
         this.previousOperand = '';

         // Add to history
         if (computation !== 'Error') {
             this.addHistoryEntry(expression, this.getDisplayNumber(computation));
         } else {
             this.addHistoryEntry(expression, 'Error');
         }


         // Add result animation
         this.currentOperandTextElement.classList.add('result-animate');
         setTimeout(() => {
             this.currentOperandTextElement.classList.remove('result-animate');
         }, 400); // Animation duration is 0.4s

         this.deactivateAllOperators(); // Clear operator highlight after computation
     }

     computeSquare() {
         const current = parseFloat(this.currentOperand);
         if (isNaN(current)) return;
         const expression = `${this.getDisplayNumber(current)}²`;
         this.currentOperand = (current * current).toString();
         this.operation = undefined;
         this.previousOperand = '';
         this.currentOperandTextElement.classList.remove('error-shake'); // Ensure error shake is removed

         this.addHistoryEntry(expression, this.getDisplayNumber(this.currentOperand));

         // Add result animation for square
         this.currentOperandTextElement.classList.add('result-animate');
         setTimeout(() => {
             this.currentOperandTextElement.classList.remove('result-animate');
         }, 400);

         this.deactivateAllOperators(); // Clear operator highlight after computation
     }

     getDisplayNumber(number) {
         if (number === 'Error') return 'Error';
         const stringNumber = number.toString();
         const integerDigits = parseFloat(stringNumber.split('.')[0]);
         const decimalDigits = stringNumber.split('.')[1];
         let integerDisplay;
         if (isNaN(integerDigits)) {
             integerDisplay = '';
         } else {
             integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
         }
         if (decimalDigits != null) {
             return `${integerDisplay}.${decimalDigits}`;
         } else {
             return integerDisplay;
         }
     }

     updateDisplay() {
         this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
         if (this.operation != null) {
             this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
         } else {
             this.previousOperandTextElement.innerText = '';
         }
     }

     // History methods
     addHistoryEntry(expression, result) {
         this.history.push({ expression: expression, result: result });
         this.updateHistoryDisplay();
     }

     clearHistory() {
         this.history = [];
         this.updateHistoryDisplay();
     }

     updateHistoryDisplay() {
         this.historyEntriesElement.innerHTML = ''; // Clear current entries
         if (this.history.length === 0) {
             const noHistoryMessage = document.createElement('div');
             noHistoryMessage.classList.add('history-item', 'text-white', 'text-center'); /* Changed text-gray-500 to text-white */
             noHistoryMessage.innerText = 'No history yet.';
             this.historyEntriesElement.appendChild(noHistoryMessage);
             return;
         }

         this.history.slice().reverse().forEach(entry => { // Display latest first
             const historyItem = document.createElement('div');
             historyItem.classList.add('history-item');

             const expressionDiv = document.createElement('div');
             expressionDiv.classList.add('history-expression');
             expressionDiv.innerText = entry.expression;

             const resultDiv = document.createElement('div');
             resultDiv.classList.add('history-result');
             resultDiv.innerText = `= ${entry.result}`;

             historyItem.appendChild(expressionDiv);
             historyItem.appendChild(resultDiv);
             this.historyEntriesElement.appendChild(historyItem);
         });
         // Scroll to bottom to show latest entry
         this.historyEntriesElement.scrollTop = this.historyEntriesElement.scrollHeight;
     }
 }

 // Get all button elements
 const numberButtons = document.querySelectorAll('[data-number]');
 const operatorButtons = document.querySelectorAll('[data-operator]');
 const equalsButton = document.querySelector('[data-equals]');
 const clearButton = document.querySelector('[data-clear]');
 const deleteButton = document.querySelector('[data-backspace]');
 const previousOperandTextElement = document.querySelector('[data-previous-operand]');
 const currentOperandTextElement = document.querySelector('[data-current-operand]');
 const historyEntriesElement = document.querySelector('[data-history-entries]');
 const clearHistoryButton = document.querySelector('[data-clear-history]');
 const themeToggleButton = document.getElementById('theme-toggle');
 const themeToggleIcon = themeToggleButton.querySelector('i');
 const body = document.body;

 // Instantiate the Calculator
 const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyEntriesElement);

 // Initial update for history display (to show 'No history yet.')
 calculator.updateHistoryDisplay();

 // Add event listeners for button clicks
 numberButtons.forEach(button => {
     button.addEventListener('click', () => {
         calculator.appendNumber(button.innerText);
         calculator.updateDisplay();
         playClickSound(); // Play sound on click
     });
 });

 operatorButtons.forEach(button => {
     button.addEventListener('click', () => {
         const op = button.dataset.op; // Get the operator from data-op attribute
         if (op === 'x²') { // Check for square button
             calculator.computeSquare();
         } else {
             calculator.chooseOperation(op, button); // Pass button element to highlight
         }
         calculator.updateDisplay();
         playClickSound(); // Play sound on click
     });
 });

 equalsButton.addEventListener('click', button => {
     calculator.compute();
     calculator.updateDisplay();
     playClickSound(); // Play sound on click
 });

 clearButton.addEventListener('click', button => {
     calculator.clear();
     calculator.updateDisplay();
     playClickSound(); // Play sound on click
 });

 deleteButton.addEventListener('click', button => {
     calculator.delete();
     calculator.updateDisplay();
     playClickSound(); // Play sound on click
 });

 // Event listener for Clear History button
 clearHistoryButton.addEventListener('click', () => {
     calculator.clearHistory();
     playClickSound(); // Play sound on click
 });

 // Theme Toggle Functionality
 function applyTheme(theme) {
     if (theme === 'light') {
         body.classList.add('light-theme');
         themeToggleIcon.classList.remove('fa-moon');
         themeToggleIcon.classList.add('fa-sun');
         themeToggleButton.setAttribute('aria-label', 'Switch to Dark Theme');
     } else {
         body.classList.remove('light-theme');
         themeToggleIcon.classList.remove('fa-sun');
         themeToggleIcon.classList.add('fa-moon');
         themeToggleButton.setAttribute('aria-label', 'Switch to Light Theme');
     }
     localStorage.setItem('theme', theme);
 }

 // Check for saved theme preference on load
 const savedTheme = localStorage.getItem('theme');
 if (savedTheme) {
     applyTheme(savedTheme);
 } else {
     // Default to dark theme if no preference saved
     applyTheme('dark');
 }

 themeToggleButton.addEventListener('click', () => {
     if (body.classList.contains('light-theme')) {
         applyTheme('dark');
     } else {
         applyTheme('light');
     }
     playClickSound(); // Play sound on theme toggle
 });

 // Add keyboard support
 document.addEventListener('keydown', e => {
     const key = e.key;
     let operatorButton = null;

     // Determine if the key corresponds to an operator button to highlight it
     if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
         operatorButton = document.querySelector(`[data-op="${key}"]`);
     } else if (key === '^') { // For square
         operatorButton = document.querySelector(`[data-op="x²"]`);
     }

     // Play sound for all relevant key presses
     if ((key >= '0' && key <= '9') || key === '.' || key === '+' || key === '-' || key === '*' || key === '/' || key === '%' || key === '^' || key === 'Enter' || key === '=' || key === 'Backspace' || key === 'Escape') {
         playClickSound();
     }

     if ((key >= '0' && key <= '9') || key === '.') {
         calculator.appendNumber(key);
         calculator.updateDisplay();
     } else if (key === '+' || key === '-' || key === '*' || key === '/') {
         calculator.chooseOperation(key, operatorButton); // Pass button element for highlight
         calculator.updateDisplay();
     } else if (key === '%') {
         calculator.chooseOperation(key, operatorButton);
         calculator.updateDisplay();
     } else if (key === '^') { // For square (using ^ for square)
         calculator.computeSquare();
         calculator.updateDisplay();
     } else if (key === 'Enter' || key === '=') {
         e.preventDefault(); // Prevent default action (e.g., form submission)
         calculator.compute();
         calculator.updateDisplay();
     } else if (key === 'Backspace') {
         calculator.delete();
         calculator.updateDisplay();
     } else if (key === 'Escape') { // For 'AC'
         calculator.clear();
         calculator.updateDisplay();
     }
 });
