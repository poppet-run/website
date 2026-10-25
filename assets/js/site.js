if (navigator.clipboard) {
  for (const button of document.querySelectorAll(".copy-button")) {
    let reset;
    button.hidden = false;
    button.addEventListener("click", async () => {
      const code = button.closest(".code-block").querySelector("pre code");
      try {
        await navigator.clipboard.writeText(code.textContent.trimEnd());
        button.textContent = "Copied";
      } catch {
        button.textContent = "Copy failed";
      }
      clearTimeout(reset);
      reset = setTimeout(() => { button.textContent = "Copy"; }, 2000);
    });
  }
}

// Each shell shortcode holds one block per shell. Show the reader's chosen
// shell everywhere on the page and remember it for later pages.
const shellGroups = [...document.querySelectorAll(".shell-variants")].map((group) => [...group.querySelectorAll(":scope > .code-block")]);

function showShell(lang) {
  for (const blocks of shellGroups) {
    if (!blocks.some((block) => block.dataset.lang === lang)) continue;
    for (const block of blocks) {
      block.hidden = block.dataset.lang !== lang;
    }
  }
}

for (const blocks of shellGroups) {
  const labels = blocks.map((block) => block.querySelector(".code-header > span"));
  for (const [index, block] of blocks.entries()) {
    const switcher = document.createElement("div");
    switcher.className = "shell-switch";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Shell");
    for (const [optionIndex, option] of blocks.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = labels[optionIndex].textContent;
      button.setAttribute("aria-pressed", String(option === block));
      button.addEventListener("click", () => {
        showShell(option.dataset.lang);
        try { localStorage.setItem("shell", option.dataset.lang); } catch {}
        option.querySelector('.shell-switch [aria-pressed="true"]').focus();
      });
      switcher.append(button);
    }
    labels[index].replaceWith(switcher);
  }
}

let savedShell = null;
try { savedShell = localStorage.getItem("shell"); } catch {}
showShell(savedShell || "bash");
