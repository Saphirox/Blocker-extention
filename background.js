switcherTimeout = undefined;

switcher = [];

productivityHistory = [];

lockerFree = true;

function runTimer(url) {
    return setInterval(() => {
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
}

function sumProductivity() {
}

function sumProcrastination() {
}

function notifyProductivityIsDescrising(data) {
    const procrastination = sumProcrastination();
    const productivity = sumProductivity();

    productivityHistory.push({
        productivityPercent: procrastination,
        productivityPercent: productivity,
    });
}

function getCurrentApp(activeMangerObj) {
    return activeMangerObj.apps.find(el => el.name == activeMangerObj.currentTabName);
}

function notifyAboutSwitchingActivity(data) {
    const maxSiteRedirect = 5;

    if (switcher.length > maxSiteRedirect){
        const hasSwitchingProblem = switcher.map(c => c.seconds).reduce((acc, curr) => acc + curr, 0) 
        / switcher.length < 20;

        if (hasSwitchingProblem) {
            new Notification("You swipe so much time, try to relax");
            switcher = [];
        }
    }

    chrome.storage.local.get(['active-manager'], (obj) => {
        const data = obj['active-manager'];

        if (data.currentTabName) {
            switcher.push({
                hostname: data.currentTabName,
                seconds: getCurrentApp(data).seconds
            });
        }
    });
}

function checkForNotifications(data) 
{
    notifyAboutSwitchingActivity(data);
}

function showNotification() {
    chrome.browserAction.onClicked.addListener(function() {
        chrome.notifications.create("", {
            type:    "basic",
            title:   "REMINDER",
            message: "It's time to go to this super-cool site !\nProceed ?",
            contextMessage: "It's about time...",
            buttons: [{
                title: "Yes, get me there",
            }, {
                title: "Get out of my way",
            }]
        }, function(id) {
            myNotificationID = id;
        });
    });


}

chrome.runtime.onInstalled.addListener(() => {
    showNotification();
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

function paretoPrincipleWorks(prod, proc) {
    const per100 = (prod + proc);
    const per80 = per100 * 0.7;
    return per80 < prod;
}

function Main() {
    chrome.tabs.query({ highlighted: true },function(tabArr) {
        const tab = tabArr[0];

        if (switcherTimeout) {
            clearInterval(switcherTimeout);
        }

        let url = new URL(tab.url).hostname;
        console.log(url);

        switcherTimeout = runTimer(url);
        
        setTimeout(c => {
        chrome.storage.local.get(['active-manager'], (obj) => {
            const apps = obj['active-manager'].apps;

            if(!obj['active-manager'].currentTabName) {
                return;
            }

            const needToBlocked = 
                apps.find(c => 
                    c.kind === 'procrastination' && c.name == obj['active-manager'].currentTabName);
        
            const prod = 
                apps.filter(c => c.kind === 'productivity').map(c => c.seconds).reduce((acc, curr) => acc + curr, 0);
        
            const proc = 
                apps.filter(c => c.kind === 'procrastination').map(c => c.seconds).reduce((acc, curr) => acc + curr, 0);

            if (needToBlocked && !paretoPrincipleWorks(prod, proc)) {
                chrome.tabs.sendMessage(tab.id, {"sadasd": "asda"  });
            }
        });
        }, 2000)


        chrome.storage.local.get(['active-manager'], (obj) => {
            checkForNotifications(obj['active-manager']);
        });
    });
}

function lock() {
    if (lockerFree) {
        lockerFree = false;
        Main(); 
        lockerFree = true;
    }
}

chrome.tabs.onActivated.addListener(function(highlightInfo) {
    lock();
});

chrome.tabs.onHighlighted.addListener(function(highlightInfo) {
    lock();
});

chrome.tabs.onCreated.addListener(function(highlightInfo) {
    lock();
});

chrome.tabs.onUpdated.addListener(function(highlightInfo) {
    lock();
});