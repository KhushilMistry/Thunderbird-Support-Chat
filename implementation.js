var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { ExtensionSupport } = ChromeUtils.import("resource:///modules/ExtensionSupport.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var Cc = Components.classes;

var support = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    context.callOnClose(this);
    return {
      support: {
        init() {
          // Listen for the main Thunderbird windows opening.
          ExtensionSupport.registerWindowListener("supportListener", {
            // Before Thunderbird 74, messenger.xhtml was messenger.xul.
            chromeURLs: [
              "chrome://messenger/content/messenger.xhtml",
              "chrome://messenger/content/messenger.xul",
            ],
            onLoadWindow(window) {
              function onCommand() {
                let messenger = Cc["@mozilla.org/messenger;1"].createInstance();
                messenger = messenger.QueryInterface(Ci.nsIMessenger);
                messenger.launchExternalURL("https://riot.im/app/#/room/!RydlvluWjblvnIMqtY:mozilla.org");
              }
              // Add a menu item to the File menu of any main window.
              let menuPopup = window.document.getElementById("menu_HelpPopup");
              if (menuPopup) {
                let supportChatItem = window.document.createXULElement("menuitem");
                supportChatItem.id = "supportChat";
                supportChatItem.setAttribute("label", "Support Chat");
                supportChatItem.setAttribute("accesskey", "S");
                supportChatItem.addEventListener("command", onCommand);

                let supportChatItemSeprator = window.document.createXULElement("menuseparator");
                supportChatItemSeprator.id = "supportChatSeparator";

                menuPopup.appendChild(supportChatItemSeprator);
                menuPopup.appendChild(supportChatItem);
              }

              let appmenuAbout = window.document.getElementById("appmenu_about");
              if (appmenuAbout) {
                let supportChatToolItem = window.document.createXULElement("toolbarbutton");
                supportChatToolItem.id = "supportChatToolItem";
                supportChatToolItem.setAttribute("label", "Support Chat");
                supportChatToolItem.setAttribute("accesskey", "S");
                supportChatToolItem.addEventListener("command", onCommand);
                supportChatToolItem.setAttribute("class", "subviewbutton subviewbutton-iconic");

                let supportChatToolSeparator = window.document.createXULElement("toolbarseparator");
                supportChatToolSeparator.id = "supportChatToolSeparator";

                let parentNode = appmenuAbout.parentElement;
                parentNode.insertBefore(supportChatToolSeparator, appmenuAbout);
                parentNode.insertBefore(supportChatToolItem, supportChatToolSeparator);
              }
            },
          });
        },
      },
    };
  }

  close() {
    // Clean up any existing windows that have the menu item.
    for (let window of Services.wm.getEnumerator("mail:3pane")) {
      let supportChatSeparator = window.document.getElementById("supportChatSeparator");
      if (supportChatSeparator) {
        supportChatSeparator.remove();
      }

      let supportChatItem = window.document.getElementById("supportChat");
      if (supportChatItem) {
        supportChatItem.remove();
      }

      let supportChatToolSeparator = window.document.getElementById("supportChatToolSeparator");
      if (supportChatToolSeparator) {
        supportChatToolSeparator.remove();
      }

      let supportChatToolItem = window.document.getElementById("supportChatToolItem");
      if (supportChatToolItem) {
        supportChatToolItem.remove();
      }
    }
    // Stop listening for new windows.
    ExtensionSupport.unregisterWindowListener("supportListener");
  }
};