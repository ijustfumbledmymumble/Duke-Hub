// ==UserScript==
// @name         Duke Hub (Cross-Origin Fix)
// @match        *://*.login.i-ready.com/*
// @match        *://*.cdn.i-ready.com/*
// @noframes     false
// ==UserScript==

(function() {
    // Detect if this specific instance of the script is running inside the main window or the iframe
    const isTopWindow = (window === window.top);

    // Dynamic state tracker for this frame
    let enterKeyEnabled = false;
    let enterKeyScriptInitialized = false;

    // --- 1. CORE ENTER KEY ENGINE ---
    function runEnterKeyScript() {
        if (enterKeyScriptInitialized) return;
        enterKeyScriptInitialized = true;

        function clickNextButton() {
            try {
                // Scans the current frame's document context
                let container = document.querySelector('#screen > div.tab-buttons.small-tab-buttons');
                let buttons = container ? container.querySelectorAll('button') : [];
                
                if (buttons.length === 0) {
                    buttons = document.querySelectorAll('.tab-buttons button, .small-tab-buttons button');
                }

                if (buttons.length === 0) return;

                let targetButton = null;
                for (let btn of buttons) {
                    const text = btn.innerText.toLowerCase().trim();
                    if (text.includes('next') || text.includes('done') || text.includes('continue') || text.includes('submit')) {
                        targetButton = btn;
                        break;
                    }
                }

                if (!targetButton) {
                    targetButton = buttons[buttons.length - 1];
                }

                if (targetButton) targetButton.click();
            } catch (e) {
                // Quietly catch DOM changes
            }
        }

        window.addEventListener('keydown', (event) => {
            // Respect the cross-origin synced state
            if (!enterKeyEnabled) return;

            if (event.key === 'Enter' || event.code === 'Enter') {
                const activeEl = document.activeElement;
                if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
                    return; 
                }
                event.preventDefault(); 
                clickNextButton();
            }
        });
    }

    // --- 2. CROSS-ORIGIN BRIDGE (postMessage) ---
    if (isTopWindow) {
        // Parent window broadcasts toggle status to all child iframes
        window.broadcastToggleState = function(state) {
            enterKeyEnabled = state;
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'DUKE_HUB_TOGGLE',
                        enabled: state
                    }, '*');
                } catch (e) {
                    // Safe fallback if frame is completely unreachable
                }
            });
        };
    } else {
        // Child iframe listens for the parent's broadcast signal
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'DUKE_HUB_TOGGLE') {
                enterKeyEnabled = event.data.enabled;
                if (enterKeyEnabled) {
                    runEnterKeyScript();
                }
            }
        });
    }

    // --- 3. ANTI-AFK ENGINE (Main Page Only) ---
    let afkTimer = null;
    function runAntiAfk(isActive) {
        if (!isTopWindow) return;
        if (isActive) {
            if (afkTimer) clearInterval(afkTimer); 
            afkTimer = setInterval(() => {
                const btn = document.querySelector('#yesBtn');
                if (btn) btn.click();
            }, 1000);
        } else {
            if (afkTimer) {
                clearInterval(afkTimer);
                afkTimer = null;
            }
        }
    }

    // --- 4. UI GENERATION (ONLY SPAWNS ONCE IN THE MAIN TOP WINDOW) ---
    if (isTopWindow) {
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
        hub.appendChild(body);
        document.body.appendChild(hub);

        const scriptLibrary = {
            "Enter Key Clicks Next/Done button": {
                state: false,
                run: (state) => {
                    runEnterKeyScript(); // Init on top page
                    window.broadcastToggleState(state); // Sync to CDN iframe
                }
            },
            "Anti-AFK": {
                state: false,
                run: (state) => runAntiAfk(state)
            }
        };

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
                if (item.state) {
                    btn.style.backgroundColor = '#00ff00';
                    btn.style.color = '#1e1e24';
                    btn.style.borderColor = '#00ff00';
                } else {
                    btn.style.backgroundColor = '#2a2a35';
                    btn.style.color = '#00ffcc';
                    btn.style.borderColor = '#00ffcc';
                }
            };

            btn.onmouseover = () => { if (!item.state) { btn.style.backgroundColor = '#00ffcc'; btn.style.color = '#1e1e24'; } };
            btn.onmouseout = () => { if (!item.state) { btn.style.backgroundColor = '#2a2a35'; btn.style.color = '#00ffcc'; } };
            
            btn.addEventListener('click', () => {
                item.state = !item.state; 
                updateVisuals();
                item.run(item.state);     
            });

            body.appendChild(btn);
        });

        // Dragging Engine
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

        // Visibility Toggle (Ctrl+E)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                hub.style.display = hub.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
})();
