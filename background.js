switcherTimeout = undefined;


chrome.runtime.onInstalled.addListener(() => {


    chrome.storage.local.set({'active-manager': { 
        apps: [],
        categories: ['productivity', 'procrastination', 'uncategorized'],
        predefinedCategories: [{ 
            origin: 'https://stackoverflow.com',
            kind: 'productivity',         
        },
        { 
            origin: 'https://www.youtube.com',
            kind: 'procrastination',         
        },
        { 
            origin: 'https://developer.chrome.com',
            kind: 'productivity',         
        }]
    } });
});

chrome.tabs.onHighlighted.addListener(function(highlightInfo) {
    
    chrome.tabs.query({ active: true },function(tabArr) {
        
        const tab = tabArr[0];

        if (switcherTimeout) {
            clearInterval(switcherTimeout);
        }

        let url = new URL(tab.url);
        console.log(url.origin);

        switcherTimeout = setInterval(() => {
            chrome.storage.local.get(['active-manager'], (obj) => {
                const activeMangerObj = obj['active-manager'];
                activeMangerObj.currentTabName = url.origin;
               
                const app = activeMangerObj.apps.filter(el => el.name == url.origin);
                
                if (!app.length) {
                    
                    const appCategory = 
                        activeMangerObj.predefinedCategories.find(el => el.origin == url.origin);

                    if (appCategory)  {
                        activeMangerObj.apps.push({ seconds: 0 , name: url.origin, kind: appCategory.kind });
                    } 
                    else {
                        activeMangerObj.apps.push({ seconds: 0 , name: url.origin, kind: 'uncategorized' });
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