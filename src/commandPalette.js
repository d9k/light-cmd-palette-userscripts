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
    // When false, losing focus on the input must not close the palette (used for
    // mouse clicks on command items: the item is not focusable, so pressing it
    // blurs the input before the click event can run the command).
    let closeOnInputUnfocus = true

    function openCommandPalette () {
      if (dialog.open) return
      // showModal() puts the palette in the top layer: host-page scripts can no
      // longer intercept its keyboard events or move focus out of it, and the
      // browser closes it natively on Escape. Fall back to lightbox mode for
      // browsers without <dialog> support.
      if (typeof dialog.showModal === 'function') {
        dialog.showModal()
      } else {
        dialog.open = true
      }
      commandInput.focus()
      updateCommandList('')
    }

    function closeCommandPalette () {
      if (!dialog.open) return
      if (typeof dialog.close === 'function') {
        dialog.close()
      } else {
        dialog.open = false
        commandInput.value = ''
        currentIndex = -1
      }
    }

    // Reset the state no matter how the dialog was closed (Escape, footer click,
    // focus loss, native modal dismissal, ...).
    dialog.addEventListener('close', () => {
      closeOnInputUnfocus = true
      commandInput.value = ''
      currentIndex = -1
    })

    function updateCommandList (input) {
      commandList.innerHTML = ''
      const filteredCommands = input
        ? commands.filter(cmd => cmd.name.toLowerCase().includes(input.toLowerCase()))
        : commands

      filteredCommands.forEach((cmd, index) => {
        const li = document.createElement('li')
        li.textContent = cmd.name
        li.onclick = () => {
          closeOnInputUnfocus = true
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

    // Some browsers treat the first Escape as "blur the field" (or the host page
    // swallows it), so the palette closes only on the second press. Handle Escape
    // directly on the input so the first press always closes the palette.
    commandInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        closeCommandPalette()
      }
    })

    // In Firefox the first Escape only blurs the input, and we never see a key
    // event we can catch; so treat any focus loss on the field as a request to
    // close the palette. This also gives the usual "click outside closes" feel.
    commandInput.addEventListener('focusout', (event) => {
      if (!dialog.open || !closeOnInputUnfocus) return
      // Focus moving to something inside the dialog must not close it.
      if (dialog.contains(event.relatedTarget)) return
      closeCommandPalette()
    })

    commandList.addEventListener('mousedown', () => {
      closeOnInputUnfocus = false
    })

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
