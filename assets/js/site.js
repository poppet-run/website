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
