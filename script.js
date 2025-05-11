class Calculator {
    constructor() {
        this.display = document.querySelector('.display-content');
        this.equationDisplay = document.querySelector('.display-equation');
        this.currentInput = '0';
        this.equation = '';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.isShiftPressed = false;
        this.isAlphaPressed = false;
        this.currentMode = 'COMP'; // Default mode
        this.memory = 0;
        this.lastAnswer = 0;
        this.degreeMode = true; // true for DEG, false for RAD
        this.initialize();
    }

    initialize() {
        this.attachEventListeners();
        this.updateDisplayIndicators();
    }

    attachEventListeners() {
        document.querySelectorAll('.key').forEach(button => {
            button.addEventListener('click', () => {
                let value;
                
                // Get the primary text of the button
                if (button.classList.contains('function-key')) {
                    // For function keys, get the gold-text content
                    const goldText = button.querySelector('.gold-text');
                    if (goldText) {
                        value = goldText.textContent;
                    }
                    
                    // If SHIFT is pressed, get the alternate function (alpha-text content)
                    if (this.isShiftPressed) {
                        const alphaText = button.querySelector('.alpha-text');
                        if (alphaText) {
                            value = alphaText.textContent;
                        }
                    }
                } else {
                    value = button.textContent;
                }
                
                this.handleButtonClick(value);
            });
        });

        // Add keyboard support
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            if (key >= '0' && key <= '9' || key === '.' || 
                key === '+' || key === '-' || key === '*' || key === '/' ||
                key === 'Enter' || key === 'Backspace' || key === 'Escape' ||
                key === '(' || key === ')') {
                event.preventDefault();
                
                // Map keyboard keys to calculator keys
                const keyMap = {
                    '*': '×',
                    '/': '÷',
                    '-': '−',
                    'Enter': '=',
                    'Backspace': 'DEL',
                    'Escape': 'AC'
                };
                
                this.handleButtonClick(keyMap[key] || key);
            }
        });
    }

    handleButtonClick(value) {
        // Handle mode buttons
        if (value === 'SHIFT') {
            this.isShiftPressed = !this.isShiftPressed;
            this.isAlphaPressed = false;
            this.updateDisplayIndicators();
            return;
        }
        if (value === 'ALPHA') {
            this.isAlphaPressed = !this.isAlphaPressed;
            this.isShiftPressed = false;
            this.updateDisplayIndicators();
            return;
        }
        if (value === 'MODE') {
            this.handleMode();
            return;
        }
        if (value === 'ON' || value === 'AC') {
            this.handleClear();
            return;
        }
        if (value === 'SETUP') {
            // In a real calculator, this would show setup menu
            return;
        }

        // Handle numeric input and basic operations
        if (value >= '0' && value <= '9') {
            this.handleNumber(value);
        } else if (value === '.') {
            this.handleDecimal();
        } else if (value === 'DEL') {
            this.handleDelete();
        } else if (value === '=') {
            this.handleEquals();
        } else if (['+', '−', '×', '÷', '^'].includes(value)) {
            this.handleOperator(value);
        } else if (value === '(-)' || value === '(−)') {
            this.handleNegate();
        } else if (value === 'Ans') {
            this.handleAns();
        } else if (value === '(' || value === ')') {
            this.handleParenthesis(value);
        } else if (value === '×10ˣ') {
            this.handleExponent();
        } else if (value === 'π') {
            this.handlePi();
        } else if (value === 'e') {
            this.handleE();
        } else {
            // Handle scientific functions
            this.handleScientificFunction(value);
        }
        
        // Reset SHIFT and ALPHA after an operation
        if (value !== 'SHIFT' && value !== 'ALPHA') {
            this.isShiftPressed = false;
            this.isAlphaPressed = false;
            this.updateDisplayIndicators();
        }
    }

    handleScientificFunction(func) {
        // Store current value for use in calculation
        const value = parseFloat(this.currentInput);
        let result;
        
        switch(func) {
            // Trigonometric functions
            case 'sin':
                result = this.degreeMode ? 
                    Math.sin(value * Math.PI / 180) : 
                    Math.sin(value);
                break;
            case 'cos':
                result = this.degreeMode ? 
                    Math.cos(value * Math.PI / 180) : 
                    Math.cos(value);
                break;
            case 'tan':
                result = this.degreeMode ? 
                    Math.tan(value * Math.PI / 180) : 
                    Math.tan(value);
                break;
            case 'sin⁻¹':
                result = this.degreeMode ? 
                    Math.asin(value) * 180 / Math.PI : 
                    Math.asin(value);
                break;
            case 'cos⁻¹':
                result = this.degreeMode ? 
                    Math.acos(value) * 180 / Math.PI : 
                    Math.acos(value);
                break;
            case 'tan⁻¹':
                result = this.degreeMode ? 
                    Math.atan(value) * 180 / Math.PI : 
                    Math.atan(value);
                break;
                
            // Logarithmic functions
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case '10ˣ':
                result = Math.pow(10, value);
                break;
            case 'eˣ':
                result = Math.exp(value);
                break;
                
            // Power and root functions
            case 'x²':
                result = Math.pow(value, 2);
                break;
            case 'x³':
                result = Math.pow(value, 3);
                break;
            case '√':
                result = Math.sqrt(value);
                break;
            case '∛':
            case 'x^(1/3)':
                result = Math.cbrt(value);
                break;
            case 'x⁻¹':
                result = 1 / value;
                break;
                
            // Factorial
            case '!':
                result = this.factorial(value);
                break;
                
            // Percentage
            case '%':
                result = value / 100;
                break;
                
            // Combinations and permutations
            case 'nCr':
            case 'nPr':
                // Would require two values to calculate
                // For now, store the first value and operation
                this.previousInput = this.currentInput;
                this.operation = func;
                this.shouldResetDisplay = true;
                return;
                
            // Default case for unimplemented functions
            default:
                console.log(`Function ${func} not implemented yet`);
                return;
        }
        
        // Update equation display to show the function and input
        this.equation = `${func}(${value})`;
        this.equationDisplay.textContent = this.equation;
        
        // Update current input with result
        this.currentInput = result.toString();
        this.updateDisplay();
    }

    factorial(n) {
        // Handle non-integer input
        if (!Number.isInteger(n) || n < 0) {
            return NaN;
        }
        
        // Calculate factorial
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    handleMode() {
        const modes = ['COMP', 'STAT', 'EQN', 'MATRIX', 'TABLE'];
        const currentIndex = modes.indexOf(this.currentMode);
        this.currentMode = modes[(currentIndex + 1) % modes.length];
        
        // Additional mode-specific setup
        if (this.currentMode === 'COMP') {
            // Default computation mode
        } else if (this.currentMode === 'STAT') {
            // For statistics mode
            this.currentInput = 'STAT MODE';
            this.shouldResetDisplay = true;
        } else if (this.currentMode === 'EQN') {
            // For equation solving mode
            this.currentInput = 'EQN MODE';
            this.shouldResetDisplay = true;
        } else if (this.currentMode === 'MATRIX') {
            // For matrix calculations
            this.currentInput = 'MATRIX MODE';
            this.shouldResetDisplay = true;
        } else if (this.currentMode === 'TABLE') {
            // For table generation
            this.currentInput = 'TABLE MODE';
            this.shouldResetDisplay = true;
        }
        
        this.updateDisplayIndicators();
        this.updateDisplay();
    }

    handleNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentInput = '0';
            this.shouldResetDisplay = false;
        }
        if (this.currentInput === '0' && number !== '0') {
            this.currentInput = number;
        } else if (this.currentInput !== '0') {
            this.currentInput += number;
        }
        this.updateDisplay();
    }

    handleDecimal() {
        if (this.shouldResetDisplay) {
            this.currentInput = '0';
            this.shouldResetDisplay = false;
        }
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    handleDelete() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    handleClear() {
        this.currentInput = '0';
        this.equation = '';
        this.previousInput = '';
        this.operation = null;
        this.isShiftPressed = false;
        this.isAlphaPressed = false;
        this.updateDisplayIndicators();
        this.updateDisplay();
    }

    handleOperator(op) {
        // If we already have a pending operation, calculate it first
        if (this.operation !== null) {
            this.handleEquals();
        }
        
        // Update equation display
        this.equation = `${this.currentInput} ${op}`;
        this.equationDisplay.textContent = this.equation;
        
        this.previousInput = this.currentInput;
        this.operation = op;
        this.shouldResetDisplay = true;
    }

    handleEquals() {
        if (this.operation === null) return;

        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;

        // Complete the equation for display
        this.equation += ` ${this.currentInput} =`;
        this.equationDisplay.textContent = this.equation;

        // Perform the calculation
        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                result = prev / current;
                break;
            case '^':
                result = Math.pow(prev, current);
                break;
            case 'nCr':
                // Calculate combinations (n choose r)
                result = this.combinations(prev, current);
                break;
            case 'nPr':
                // Calculate permutations
                result = this.permutations(prev, current);
                break;
        }

        // Store the result and update display
        this.lastAnswer = result;
        this.currentInput = result.toString();
        this.operation = null;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    combinations(n, r) {
        return this.factorial(n) / (this.factorial(r) * this.factorial(n - r));
    }

    permutations(n, r) {
        return this.factorial(n) / this.factorial(n - r);
    }

    handleNegate() {
        this.currentInput = (parseFloat(this.currentInput) * -1).toString();
        this.updateDisplay();
    }

    handleAns() {
        this.currentInput = this.lastAnswer.toString();
        this.updateDisplay();
    }

    handlePi() {
        this.currentInput = Math.PI.toString();
        this.updateDisplay();
    }

    handleE() {
        this.currentInput = Math.E.toString();
        this.updateDisplay();
    }

    handleExponent() {
        this.currentInput += 'E';
        this.updateDisplay();
    }

    handleParenthesis(value) {
        if (this.currentInput === '0') {
            this.currentInput = value;
        } else {
            this.currentInput += value;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.textContent = this.currentInput;
    }

    updateDisplayIndicators() {
        const shiftIndicator = document.querySelector('.shift-indicator');
        const alphaIndicator = document.querySelector('.alpha-indicator');
        const modeIndicator = document.querySelector('.mode-indicator');
        const mathIndicator = document.querySelector('.math-indicator');

        // Update indicator visibility
        shiftIndicator.classList.toggle('active', this.isShiftPressed);
        alphaIndicator.classList.toggle('active', this.isAlphaPressed);
        mathIndicator.classList.toggle('active', true); // Math display is always on

        // Show mode letter
        switch (this.currentMode) {
            case 'COMP': modeIndicator.textContent = 'C'; break;
            case 'STAT': modeIndicator.textContent = 'S'; break;
            case 'EQN': modeIndicator.textContent = 'E'; break;
            case 'MATRIX': modeIndicator.textContent = 'M'; break;
            case 'TABLE': modeIndicator.textContent = 'T'; break;
            default: modeIndicator.textContent = 'C';
        }
        
        modeIndicator.classList.toggle('active', true);
    }
}

// Initialize the calculator when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
}); 