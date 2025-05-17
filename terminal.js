// Terminal functionality
class Terminal {
    constructor() {
        this.terminal = document.getElementById('terminal');
        this.prompt = 'C:\\> ';
        this.commandHistory = [];
        this.historyIndex = 0;
        this.initialize();
    }

    initialize() {
        // Create input line
        this.createNewInputLine();
        this.setupEventListeners();
        this.focusOnInput();
    }

    createNewInputLine() {
        const inputLine = document.createElement('div');
        inputLine.className = 'input-line';
        inputLine.innerHTML = `${this.prompt}<input type="text" class="command-input" autofocus>`;
        this.terminal.appendChild(inputLine);
        this.currentInput = inputLine.querySelector('input');
    }

    setupEventListeners() {
        document.addEventListener('click', () => this.focusOnInput());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand();
            } else if (e.key === 'ArrowUp') {
                this.navigateHistory('up');
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                this.navigateHistory('down');
                e.preventDefault();
            }
        });
    }

    focusOnInput() {
        if (this.currentInput) {
            this.currentInput.focus();
        }
    }

    handleCommand() {
        const command = this.currentInput.value.trim();
        if (command === '') return;

        // Add command to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;

        // Display the command in the terminal
        this.addLine(`${this.prompt}${command}`, 'command');
        
        // Process the command
        this.processCommand(command);
        
        // Create a new input line
        this.createNewInputLine();
        this.scrollToBottom();
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
        if (this.commandHistory.length === 0) return;

        if (direction === 'up' && this.historyIndex > 0) {
            this.historyIndex--;
        } else if (direction === 'down' && this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
        } else if (direction === 'down' && this.historyIndex === this.commandHistory.length - 1) {
            this.historyIndex++;
            this.currentInput.value = '';
            return;
        } else {
            return;
        }

        this.currentInput.value = this.commandHistory[this.historyIndex];
        // Move cursor to end of input
        const length = this.currentInput.value.length;
        this.currentInput.setSelectionRange(length, length);
    }

    addLine(text, className = '') {
        const line = document.createElement('div');
        if (className) line.className = className;
        line.textContent = text;
        this.terminal.insertBefore(line, this.currentInput.parentNode);
        this.scrollToBottom();
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
