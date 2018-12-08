switcherTimeout = undefined;

chrome.runtime.onInstalled.addListener(() => {
    const url = chrome.runtime.getURL('predefined-sites.json');

    fetch(url)
    .then((response) => response.json()) //assuming file contains json
    .then((json) => {
        chrome.storage.local.set({'active-manager': { 
            apps: [],
            categories: ['productivity', 'procrastination', 'uncategorized'],
            predefinedCategories: json 
        } 
    });
});
});

chrome.tabs.onHighlighted.addListener(function(highlightInfo) {
    
    chrome.tabs.query({ active: true },function(tabArr) {
        
        const tab = tabArr[0];

        if (switcherTimeout) {
            clearInterval(switcherTimeout);
        }

        let url = new URL(tab.url).hostname;
        console.log(url);

        switcherTimeout = setInterval(() => {
            chrome.storage.local.get(['active-manager'], (obj) => {
                const activeMangerObj = obj['active-manager'];
                activeMangerObj.currentTabName = url;
               
                const app = activeMangerObj.apps.filter(el => el.name == url);
                
                if (!app.length) {
                    
                    const appCategory = 
                        activeMangerObj.predefinedCategories.find(el => el.origin == url);

                    if (appCategory)  {
                        activeMangerObj.apps.push({ seconds: 0 , name: url, kind: appCategory.kind });
                    } 
                    else {
                        activeMangerObj.apps.push({ seconds: 0 , name: url, kind: 'uncategorized' });
                    }

                    console.log(activeMangerObj.apps);
                    chrome.storage.local.set({ 'active-manager': activeMangerObj }, function() {
                    });
                } else {
                    app[0].seconds++;
                    console.log(app.seconds);
                    chrome.storage.local.set({ 'active-manager': activeMangerObj }, function() {
                    });
                }
            });
        }, 1000);
    });
});