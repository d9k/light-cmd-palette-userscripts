export function initializeCommandPalette (commands, options = {}) {
  const defaultOptions = {
    shortcutKey: 'H', // Default key
    ctrlKey: true, // Use Ctrl key
    shiftKey: true, // Use Shift key
    altKey: false // Do not use Alt key by default
  }

  // Options may be a single object or an array of objects (one per shortcut).
  // Each entry is merged over the defaults, so omitted keys keep default values.
  const configs = (Array.isArray(options) ? options : [options])
    .map((option) => ({ ...defaultOptions, ...option }))

  const matchesConfig = (event, config) =>
    (config.ctrlKey === event.ctrlKey) &&
    (config.shiftKey === event.shiftKey) &&
    (config.altKey === event.altKey) &&
    (event.key.toUpperCase() === config.shortcutKey.toUpperCase())

  document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.createElement('dialog')
    dialog.id = 'command-palette'
    dialog.className = 'command-palette'
    dialog.innerHTML = `
            <input type="text" id="command-input" class="command-input" placeholder="Type a command...">
            <ul id="command-list" class="command-list"></ul>
            <footer title="Click to close">
                <p>Press <kbd>↵</kbd> to select, <kbd>↑</kbd> <kbd>↓</kbd> to navigate, <kbd>Esc</kbd> to exit</p>
            </footer>
        `
    document.body.appendChild(dialog)
    const commandInput = document.getElementById('command-input')
    const commandList = document.getElementById('command-list')

    dialog.querySelector('footer').addEventListener('click', () => {
      closeCommandPalette()
    })

    let currentIndex = -1

    function openCommandPalette () {
      document.getElementById('command-palette').open = true
      commandInput.focus()
      updateCommandList('')
    }

    function closeCommandPalette () {
      document.getElementById('command-palette').open = false
      commandInput.value = ''
      currentIndex = -1
    }

    function updateCommandList (input) {
      commandList.innerHTML = ''
      const filteredCommands = input
        ? commands.filter(cmd => cmd.name.toLowerCase().includes(input.toLowerCase()))
        : commands

      filteredCommands.forEach((cmd, index) => {
        const li = document.createElement('li')
        li.textContent = cmd.name
        li.onclick = () => {
          cmd.action()
          closeCommandPalette()
        }
        if (index === currentIndex) {
          li.classList.add('selected')
        }
        commandList.appendChild(li)
      })
    }

    commandInput.addEventListener('input', (e) => updateCommandList(e.target.value))

    // Navigation keys are handled while the palette is open only, so the page
    // keeps its own arrow/Enter behaviour when the palette is closed.
    document.addEventListener('keydown', (event) => {
      if (!dialog.open) return
      const items = commandList.getElementsByTagName('li')
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        event.stopImmediatePropagation()
        currentIndex = (currentIndex + 1) % items.length
        updateCommandList(commandInput.value)
        return false
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (currentIndex <= 0) currentIndex = items.length
        currentIndex = (currentIndex - 1) % items.length
        updateCommandList(commandInput.value)
        return false
      } else if (event.key === 'Enter' && currentIndex >= 0) {
        event.preventDefault()
        event.stopImmediatePropagation()
        items[currentIndex].click()
        return false
      } else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        closeCommandPalette()
        return false
      }
    }, { capture: true })

    // Open command palette with Ctrl+Shift+H; pressing the shortcut again closes it
    // Toggle the palette with any of the configured shortcuts
    document.addEventListener('keydown', (event) => {
      if (configs.some((config) => matchesConfig(event, config))) {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (dialog.open) {
          closeCommandPalette()
        } else {
          openCommandPalette()
        }
        return false
      }
    }, { capture: true })
  })
}
