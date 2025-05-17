// Terminal functionality
class Terminal {
    constructor() {
        this.terminal = document.getElementById('terminal');
        this.prompt = 'C:\\>';
        this.commandHistory = [];
        this.historyIndex = 0;
        this.isProcessingCommand = false;
        this.initialize();
    }

    initialize() {
        // Clear any existing content except the initial header
        const header = this.terminal.querySelector('.output');
        this.terminal.innerHTML = '';
        if (header) {
            this.terminal.appendChild(header);
        } else {
            // Create default header if it doesn't exist
            const output = document.createElement('div');
            output.className = 'output';
            output.innerHTML = `
                <p>Microsoft(R) MS-DOS(R) Version 6.22</p>
                <p>(C)Copyright Microsoft Corp 1981-1994. All rights reserved.</p>
            `;
            this.terminal.appendChild(output);
        }
        
        // Create input line
        this.createNewInputLine();
        this.setupEventListeners();
        this.focusOnInput();
    }

    createNewInputLine() {
        if (this.isProcessingCommand) return;
        
        const inputLine = document.createElement('div');
        inputLine.className = 'input-line';
        
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = this.prompt + ' ';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'command-input';
        input.spellcheck = false;
        input.autocapitalize = 'off';
        input.autocomplete = 'off';
        
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '_';
        
        inputLine.appendChild(promptSpan);
        inputLine.appendChild(input);
        inputLine.appendChild(cursor);
        
        this.terminal.appendChild(inputLine);
        this.currentInput = input;
        
        // Auto-focus and position cursor at the end
        this.focusOnInput();
    }

    setupEventListeners() {
        document.addEventListener('click', () => this.focusOnInput());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Tab completion could be implemented here
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (this.currentInput) {
                    this.currentInput.value = '';
                }
            }
        });
        
        // Handle input changes to update cursor position
        this.terminal.addEventListener('input', (e) => {
            if (e.target.classList.contains('command-input')) {
                this.updateCursorPosition();
            }
        });
    }
    
    updateCursorPosition() {
        const cursor = this.terminal.querySelector('.cursor');
        if (cursor) {
            // Simple blink animation
            cursor.style.visibility = cursor.style.visibility === 'hidden' ? 'visible' : 'hidden';
            setTimeout(() => {
                cursor.style.visibility = 'visible';
            }, 200);
        }
    }

    focusOnInput() {
        if (this.currentInput && !this.currentInput.disabled) {
            this.currentInput.focus();
            
            // Ensure cursor is visible
            const cursor = this.terminal.querySelector('.cursor');
            if (cursor) {
                cursor.style.visibility = 'visible';
                // Reset animation
                cursor.style.animation = 'none';
                void cursor.offsetHeight; // Trigger reflow
                cursor.style.animation = 'blink 1s step-end infinite';
            }
        }
    }

    async handleCommand() {
        if (this.isProcessingCommand) return;
        
        const inputElement = this.currentInput;
        const command = inputElement.value.trim();
        
        if (command === '') {
            // Just add a new prompt if empty
            this.addLine(`${this.prompt}`, 'prompt-line');
            this.createNewInputLine();
            return;
        }
        
        // Disable input while processing
        this.isProcessingCommand = true;
        inputElement.disabled = true;
        
        try {
            // Add command to history if it's different from the last command
            if (this.commandHistory[this.commandHistory.length - 1] !== command) {
                this.commandHistory.push(command);
            }
            this.historyIndex = this.commandHistory.length;

            // Display the command in the terminal
            this.addLine(`${this.prompt} ${command}`, 'command');
            
            // Process the command
            await this.processCommand(command);
            
        } catch (error) {
            console.error('Error processing command:', error);
            this.addLine(`Error: ${error.message}`, 'error');
        } finally {
            // Create a new input line
            this.isProcessingCommand = false;
            this.createNewInputLine();
            this.scrollToBottom();
        }
    }

    processCommand(command) {
        const cmd = command.toLowerCase().split(' ')[0];
        const args = command.split(' ').slice(1);

        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'echo':
                this.addLine(args.join(' '));
                break;
            case 'time':
                this.addLine(new Date().toLocaleTimeString());
                break;
            case 'date':
                this.addLine(new Date().toLocaleDateString());
                break;
            case 'ver':
                this.addLine('MS-DOS Version 6.22');
                break;
            case 'dir':
                this.showDirectory();
                break;
            case 'color':
                this.changeColor(args[0]);
                break;
            default:
                this.addLine(`'${cmd}' is not recognized as an internal or external command,`);
                this.addLine('operable program or batch file.');
                this.addLine('Type HELP for a list of available commands.');
        }
    }

    showHelp() {
        const commands = [
            'HELP    - Display this help message',
            'CLEAR   - Clear the terminal screen',
            'ECHO    - Display a message',
            'TIME    - Display current time',
            'DATE    - Display current date',
            'VER     - Display version information',
            'DIR     - List directory contents',
            'COLOR   - Change text color (e.g., COLOR 0A for green on black)'
        ];
        commands.forEach(cmd => this.addLine(cmd));
    }

    clearTerminal() {
        // Keep the first two lines (MS-DOS header)
        const header = this.terminal.querySelectorAll('div')[0];
        const promptLine = this.terminal.querySelectorAll('div')[1];
        
        // Clear everything
        this.terminal.innerHTML = '';
        
        // Add back the header and a new prompt
        if (header) this.terminal.appendChild(header);
        if (promptLine) this.terminal.appendChild(promptLine);
        
        this.createNewInputLine();
    }

    showDirectory() {
        const files = [
            'AUTOEXEC.BAT',
            'COMMAND.COM',
            'CONFIG.SYS',
            'IO.SYS',
            'MSDOS.SYS',
            'README.TXT'
        ];
        
        this.addLine(` Volume in drive C is SYSTEM`);
        this.addLine(` Volume Serial Number is 1A2B-3C4D`);
        this.addLine(' Directory of C:\\');
        this.addLine('');
        
        files.forEach(file => {
            this.addLine(`         ${file}`);
        });
        
        this.addLine(`               ${files.length} File(s)`);
        this.addLine('                     0 Dir(s)');
    }

    changeColor(colorCode) {
        if (!colorCode || colorCode.length === 0) {
            this.addLine('Specifies color attributes of console output.');
            this.addLine('');
            this.addLine('COLOR [attr]');
            this.addLine('');
            this.addLine('  attr        Specifies color attribute of console output');
            this.addLine('             0 = Black       8 = Gray');
            this.addLine('             1 = Blue        9 = Light Blue');
            this.addLine('             2 = Green       A = Light Green');
            this.addLine('             3 = Aqua        B = Light Aqua');
            this.addLine('             4 = Red         C = Light Red');
            this.addLine('             5 = Purple      D = Light Purple');
            this.addLine('             6 = Yellow      E = Light Yellow');
            this.addLine('             7 = White       F = Bright White');
            this.addLine('');
            this.addLine('Example: "COLOR 0A" produces green on black.');
            return;
        }
        
        // In a real terminal, this would change the text color
        this.addLine(`Color changed to ${colorCode} (visual change not implemented in this demo)`);
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0 || !this.currentInput) return;
        
        let newIndex = this.historyIndex;
        
        if (direction === 'up' && this.historyIndex > 0) {
            newIndex = this.historyIndex - 1;
        } else if (direction === 'down' && this.historyIndex < this.commandHistory.length - 1) {
            newIndex = this.historyIndex + 1;
        } else if (direction === 'down' && this.historyIndex === this.commandHistory.length - 1) {
            newIndex = this.commandHistory.length;
            this.currentInput.value = '';
            this.historyIndex = newIndex;
            return;
        } else {
            return;
        }
        
        // Update the input value if we have a valid history item
        if (newIndex >= 0 && newIndex < this.commandHistory.length) {
            this.currentInput.value = this.commandHistory[newIndex];
            this.historyIndex = newIndex;
            
            // Move cursor to end of input
            const length = this.currentInput.value.length;
            this.currentInput.setSelectionRange(length, length);
        } else if (newIndex === this.commandHistory.length) {
            this.currentInput.value = '';
            this.historyIndex = newIndex;
        }
    }

    addLine(text, className = '') {
        const line = document.createElement('div');
        if (className) line.className = className;
        
        // Handle multi-line text with proper line breaks
        const lines = text.split('\n');
        lines.forEach((lineText, index) => {
            if (index > 0) {
                line.appendChild(document.createElement('br'));
            }
            line.appendChild(document.createTextNode(lineText));
        });
        
        // Insert before the current input line if it exists
        const inputLine = this.currentInput ? this.currentInput.closest('.input-line') : null;
        if (inputLine) {
            this.terminal.insertBefore(line, inputLine);
        } else {
            this.terminal.appendChild(line);
        }
        
        this.scrollToBottom();
        return line;
    }

    scrollToBottom() {
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const terminal = new Terminal();
    
    // Add click handler for terminal controls
    document.querySelector('.close')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to close the terminal?')) {
            document.body.innerHTML = '<div style="color: #00ff00; text-align: center; margin-top: 50px;">Terminal session ended. Refresh the page to start a new session.</div>';
        }
    });
    
    // Minimize/maximize are just for show in this demo
    document.querySelector('.minimize')?.addEventListener('click', () => {
        alert('Minimize functionality not implemented in this demo');
    });
    
    document.querySelector('.maximize')?.addEventListener('click', () => {
        alert('Maximize functionality not implemented in this demo');
    });
});
