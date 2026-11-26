if (navigator.clipboard) {
  for (const button of document.querySelectorAll(".copy-button")) {
    let reset;
    button.hidden = false;
    button.addEventListener("click", async () => {
      const code = button.closest(".code-block").querySelector("pre code");
      try {
        await navigator.clipboard.writeText(code.textContent.trimEnd());
        button.textContent = "Copied";
        button.dataset.state = "copied";
      } catch {
        button.textContent = "Copy failed";
        delete button.dataset.state;
      }
      clearTimeout(reset);
      reset = setTimeout(() => {
        button.textContent = "Copy";
        delete button.dataset.state;
      }, 2000);
    });
  }
}

// Each shell shortcode holds one block per shell. Show the reader's chosen
// shell everywhere on the page and remember it for later pages.
const shellGroups = [...document.querySelectorAll(".shell-variants")].map((group) => [...group.querySelectorAll(":scope > .code-block")]);

// bash blocks also work in zsh, so a zsh reader sees bash where a group has no zsh block.
const shellFallbacks = { zsh: "bash" };

function showShell(lang) {
  for (const blocks of shellGroups) {
    const shown = [lang, shellFallbacks[lang]].find((candidate) => blocks.some((block) => block.dataset.lang === candidate));
    if (!shown) continue;
    for (const block of blocks) {
      block.hidden = block.dataset.lang !== shown;
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

// Highlight the current section in the desktop "On this page" table of contents.
const tocLinks = [...document.querySelectorAll(".docs-toc .table-of-contents a[href^='#']")];
if (tocLinks.length > 0 && "IntersectionObserver" in window) {
  const linkById = new Map(tocLinks.map((link) => [decodeURIComponent(link.getAttribute("href").slice(1)), link]));
  const headings = [...linkById.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  let activeId = headings[0]?.id;

  const setActive = (id) => {
    if (!id) return;
    activeId = id;
    for (const [key, link] of linkById) {
      if (key === id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  if (headings.length > 0) {
    setActive(activeId);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        } else {
          const passed = headings.filter((h) => h.getBoundingClientRect().top <= 120);
          if (passed.length > 0) setActive(passed[passed.length - 1].id);
        }
      },
      { rootMargin: "-16px 0px -70% 0px", threshold: 0 }
    );
    for (const heading of headings) observer.observe(heading);
  }
}
