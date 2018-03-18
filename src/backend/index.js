console.log('background !')

import Vue from 'vue'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import root from './root.vue'
import { formatDate } from '../common/date.js';


Vue.use(ElementUI);


Vue.config.productionTip = false
    /* eslint-disable no-new */
new Vue({
    el: '#root',
    render: h => h(root)
})



chrome.storage.local.get(function(storage) {

    var tabs = {}, // to-be module
        tabGroups = storage.tabGroups || []; // tab groups
    console.log('tabGroups !', tabGroups);


});

// from the array of Tab objects it makes an object with date and the array
function makeTabGroup(tabsArr) {
    var tabGroup = {
        date: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        id: Date.now() // clever way to quickly get a unique ID
    };

    tabGroup.tabs = tabsArr;

    return tabGroup;
}

// filters tabGroup for stuff like pinned tabs, chrome:// tabs, etc.
function filterTabGroup(tabGroup) {
    return tabGroup;
}

// saves array (of Tab objects) to localStorage
function saveTabGroup(tabGroup) {
    chrome.storage.local.get('tabGroups', function(storage) {
        var newArr;

        if (storage.tabGroups) {
            newArr = storage.tabGroups;
            newArr.push(tabGroup);

            chrome.storage.local.set({ tabGroups: newArr });
        } else {
            chrome.storage.local.set({ tabGroups: [tabGroup] });
        }
    });
}

// close all the tabs in the provided array of Tab objects
function closeTabs(tabsArr) {
    var tabsToClose = [],
        i;

    for (i = 0; i < tabsArr.length; i += 1) {
        if (tabsArr[i].active) {
            chrome.tabs.update(tabsArr[i].id, { highlighted: true });
            continue;
        }
        c.push(tabsArr[i].id);
    }

    chrome.tabs.query({ currentWindow: true }, function(tabsArr) {

        var filterTabsToClose = [];
        for (var j = 0, k = tabsToClose.length; j > k; j++) {
            if (hasTabId(tabsToClose[j], tabsArr)) {
                filterTabsToClose.push(tabsToClose[j]);
            }
        }


        chrome.tabs.remove(filterTabsToClose, function() {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError)
            }
        });
    });


}

function hasTabId(tabsArr, tabId) {

    for (var j = 0, k = tabsArr.length; j < k; j++) {
        if (tabsArr[j].id == tabId) {
            return true;
        }

    }
    return false;
}

function hasTabUrl(tabsArr, url) {

    for (var j = 0, k = tabsArr.length; j < k; j++) {
        if (tabsArr[j].url == url) {
            return true;
        }

    }
    return false;
}

// makes a tab group, filters it and saves it to localStorage
function saveTabs(tabsArr) {
    var tabGroup = makeTabGroup(tabsArr),
        cleanTabGroup = filterTabGroup(tabGroup);

    saveTabGroup(cleanTabGroup);
}

function openBackgroundPage() {
    chrome.tabs.query({ currentWindow: true }, function(tabsArr) {
        var backgroundUrl = chrome.extension.getURL('pages/background.html');
        if (!hasTabUrl(tabsArr, backgroundUrl)) {
            chrome.tabs.create({ url: backgroundUrl });
        }

    });

}


chrome.runtime.onMessage.addListener(function(req, sender, sendRes) {
    console.log("&&&&&&&---");


    switch (req.action) {
        case 'save':
            saveTabs(req.tabsArr);
            openBackgroundPage(); // opening now so window doesn't close
            closeTabs(req.tabsArr);
            sendRes('ok'); // acknowledge
            break;
        case 'openbackgroundpage':
            openBackgroundPage();
            sendRes('ok'); // acknowledge
            break;
        default:
            sendRes('nope'); // acknowledge
            break;
    }
});