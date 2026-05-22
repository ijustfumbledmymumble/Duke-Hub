(function() {
    const scriptLibrary = {

        "Enter Key Clicks Next/Done button": {
            isToggle: true,
            state: false,
            run:
               function clickAllButtons() {
  const container = document.querySelector('#screen > div.tab-buttons.next-button.small-tab-buttons'); 
  
  if (!container) {
    console.log("Container div not found. Double check the page structure.");
    return;
  }

  const buttons = container.querySelectorAll('button');
  
  buttons.forEach(button => button.click());
window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.code === 'Enter') {
    event.preventDefault(); 
    clickAllButtons();
  }
});
            }
        },
        "Anti AFK": {
        isToggle: true,
        state: false,
        run:  while (true) {{
  document.querySelector('#yesBtn').click();
 }
        },
    };

    const existingHub = document.getElementById('custom-script-hub');
    if (existingHub) existingHub.remove();

    const hub = document.createElement('div');
    hub.id = 'custom-script-hub';
    Object.assign(hub.style, {
        position: 'fixed', top: '20px', right: '20px', width: '220px',
        backgroundColor: '#1e1e24', color: '#ffffff', border: '2px solid #00ffcc',
        borderRadius: '8px', fontFamily: 'Arial, sans-serif', zIndex: '999999',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'block'
    });

    const header = document.createElement('div');
    header.innerText = 'Duke Hub';
    Object.assign(header.style, {
        padding: '10px', background: '#00ffcc', color: '#1e1e24',
        fontWeight: 'bold', cursor: 'move', textAlign: 'center', userSelect: 'none'
    });
    hub.appendChild(header);

    const body = document.createElement('div');
    body.style.padding = '10px';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    Object.keys(scriptLibrary).forEach(name => {
        const item = scriptLibrary[name];
        const btn = document.createElement('button');
        btn.innerText = name;
        
        Object.assign(btn.style, {
            padding: '8px', backgroundColor: '#2a2a35', color: '#00ffcc',
            border: '1px solid #00ffcc', borderRadius: '4px', cursor: 'pointer',
            fontWeight: 'bold', transition: '0.2s'
        });

        const updateVisuals = () => {
            if (item.isToggle && item.state) {
                btn.style.backgroundColor = '#00ff00';
                btn.style.color = '#1e1e24';
                btn.style.borderColor = '#00ff00';
            } else {
                btn.style.backgroundColor = '#2a2a35';
                btn.style.color = '#00ffcc';
                btn.style.borderColor = '#00ffcc';
            }
        };

        btn.onmouseover = () => { 
            if (!item.isToggle || !item.state) {
                btn.style.backgroundColor = '#00ffcc'; 
                btn.style.color = '#1e1e24'; 
            }
        };
        btn.onmouseout = () => { 
            if (!item.isToggle || !item.state) {
                btn.style.backgroundColor = '#2a2a35'; 
                btn.style.color = '#00ffcc'; 
            }
        };
        
        // Click Logic
        btn.addEventListener('click', () => {
            if (item.isToggle) {
                item.state = !item.state; 
                updateVisuals();
                item.run(item.state);     
            } else {
                item.run();              
            }
        });

        body.appendChild(btn);
    });

    hub.appendChild(body);
    document.body.appendChild(hub);

    let isDragging = false, offsetX, offsetY;
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - hub.offsetLeft;
        offsetY = e.clientY - hub.offsetTop;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        hub.style.left = `${e.clientX - offsetX}px`;
        hub.style.top = `${e.clientY - offsetY}px`;
        hub.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => isDragging = false);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            hub.style.display = hub.style.display === 'none' ? 'block' : 'none';
        }
    });

    console.log("Hub window opened press ctrl+e to toggle it");
})();
