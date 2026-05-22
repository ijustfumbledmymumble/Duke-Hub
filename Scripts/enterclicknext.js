function clickAllButtons() {
  const container = document.querySelector('#screen > div.tab-buttons.next-button.small-tab-buttons'); 
  
  if (!container) {
    console.log("Container div not found. Double check the page structure.");
    return;
  }

  const buttons = container.querySelectorAll('button');
  
  buttons.forEach(button => button.click());
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.code === 'Enter') {
    event.preventDefault(); 
    clickAllButtons();
  }
});
