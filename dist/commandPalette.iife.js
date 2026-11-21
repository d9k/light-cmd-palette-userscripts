var LightCmdPalette = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/commandPalette.js
  var commandPalette_exports = {};
  __export(commandPalette_exports, {
    initializeCommandPalette: () => initializeCommandPalette
  });
  function initializeCommandPalette(commands, options = {}) {
    const defaultOptions = {
      shortcutKey: "H",
      // Default key
      ctrlKey: true,
      // Use Ctrl key
      shiftKey: true,
      // Use Shift key
      altKey: false
      // Do not use Alt key by default
    };
    const config = { ...defaultOptions, ...options };
    document.addEventListener("DOMContentLoaded", () => {
      const dialog = document.createElement("dialog");
      dialog.id = "command-palette";
      dialog.className = "command-palette";
      dialog.innerHTML = `
            <input type="text" id="command-input" class="command-input" placeholder="Type a command...">
            <ul id="command-list" class="command-list"></ul>
            <footer title="Click to close">
                <p>Press <kbd>\u21B5</kbd> to select, <kbd>\u2191</kbd> <kbd>\u2193</kbd> to navigate, <kbd>Esc</kbd> to exit</p>
            </footer>
        `;
      document.body.appendChild(dialog);
      const commandInput = document.getElementById("command-input");
      const commandList = document.getElementById("command-list");
      dialog.querySelector("footer").addEventListener("click", () => {
        closeCommandPalette();
      });
      let currentIndex = -1;
      function openCommandPalette() {
        document.getElementById("command-palette").open = true;
        commandInput.focus();
        updateCommandList("");
      }
      function closeCommandPalette() {
        document.getElementById("command-palette").open = false;
        commandInput.value = "";
        currentIndex = -1;
      }
      function updateCommandList(input) {
        commandList.innerHTML = "";
        const filteredCommands = input ? commands.filter((cmd) => cmd.name.toLowerCase().includes(input.toLowerCase())) : commands;
        filteredCommands.forEach((cmd, index) => {
          const li = document.createElement("li");
          li.textContent = cmd.name;
          li.onclick = () => {
            cmd.action();
            closeCommandPalette();
          };
          if (index === currentIndex) {
            li.classList.add("selected");
          }
          commandList.appendChild(li);
        });
      }
      commandInput.addEventListener("input", (e) => updateCommandList(e.target.value));
      document.addEventListener("keydown", (event) => {
        if (!dialog.open) return;
        const items = commandList.getElementsByTagName("li");
        if (event.key === "ArrowDown") {
          event.preventDefault();
          event.stopImmediatePropagation();
          currentIndex = (currentIndex + 1) % items.length;
          updateCommandList(commandInput.value);
          return false;
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (currentIndex <= 0) currentIndex = items.length;
          currentIndex = (currentIndex - 1) % items.length;
          updateCommandList(commandInput.value);
          return false;
        } else if (event.key === "Enter" && currentIndex >= 0) {
          event.preventDefault();
          event.stopImmediatePropagation();
          items[currentIndex].click();
          return false;
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopImmediatePropagation();
          closeCommandPalette();
          return false;
        }
      }, { capture: true });
      document.addEventListener("keydown", (event) => {
        if (config.ctrlKey === event.ctrlKey && config.shiftKey === event.shiftKey && config.altKey === event.altKey && event.key.toUpperCase() === config.shortcutKey.toUpperCase()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (dialog.open) {
            closeCommandPalette();
          } else {
            openCommandPalette();
          }
          return false;
        }
      }, { capture: true });
    });
  }
  return __toCommonJS(commandPalette_exports);
})();
