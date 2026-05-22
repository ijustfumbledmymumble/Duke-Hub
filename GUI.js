function runEnterKeyScript(isActive) {
    if (isActive && !enterKeyScriptInitialized) {
        enterKeyScriptInitialized = true;

        // The core clicker function
        function clickNextButton(targetDocument) {
            const doc = targetDocument || document;
            
            // Look for the buttons specifically inside the provided document context
            let container = doc.querySelector('#screen > div.tab-buttons.small-tab-buttons');
            let buttons = container ? container.querySelectorAll('button') : [];
            
            if (buttons.length === 0) {
                buttons = doc.querySelectorAll('.tab-buttons button, .small-tab-buttons button');
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
        }

        // Handler function to process the keystroke
        function handleKeydown(event, targetDocument) {
            const isCurrentlyEnabled = scriptLibrary["Enter Key Clicks Next/Done button"].state;
            if (!isCurrentlyEnabled) return;

            if (event.key === 'Enter' || event.code === 'Enter') {
                const activeEl = targetDocument.activeElement;
                if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
                    return; 
                }

                event.preventDefault(); 
                clickNextButton(targetDocument);
            }
        }

        // 1. Listen to the main top-level window
        window.addEventListener('keydown', (e) => handleKeydown(e, document));

        // 2. Try to bind to any iframes on the page
        try {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                // Ensure the iframe has finished loading before we touch it
                iframe.addEventListener('load', () => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        iframeDoc.addEventListener('keydown', (e) => handleKeydown(e, iframeDoc));
                        console.log("Enter key script successfully bound inside an iframe.");
                    } catch (err) {
                        console.warn("Could not access iframe internals due to Cross-Origin restrictions.", err);
                    }
                });

                // Also try binding immediately in case it's already loaded
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    iframeDoc.addEventListener('keydown', (e) => handleKeydown(e, iframeDoc));
                    console.log("Enter key script bound to pre-loaded iframe.");
                }
            });
        } catch (e) {
            console.error("Error setting up iframe listeners:", e);
        }
    }
}
