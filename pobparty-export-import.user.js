// ==UserScript==
// @name         pob.party export/import
// @namespace    https://github.com/Sighmir
// @version      0.1
// @description  Export/Import all folders and builds on pob.party to/from JSON format
// @author       Sighmir
// @match        https://pob.party/*
// @require      https://cdn.jsdelivr.net/npm/@sighmir/indexeddb-export-import@latest/index.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

window.downloadAsJson = (jsonString, exportName) => {
  var dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

window.getBuilds = () => {
  const request = indexedDB.open("/data");

  request.onerror = event => {
    console.log("Failed to connect to IndexedDB!");
  };

  request.onsuccess = async event => {
    const idb_db = event.target.result;
    try {
      const jsonObject = await IDBExportImport.exportToObject(idb_db);

      const dataTable = jsonObject.FILE_DATA;
      Object.keys(dataTable).forEach(key => {
        if (dataTable[key].contents) {
          dataTable[key].contents = Object.values(dataTable[key].contents);
        }
      });

      downloadAsJson(JSON.stringify(jsonObject), "pobparty");
    } catch (err) {
      console.error(err);
    }
  };
};

window.loadBuilds = jsonString => {
  const request = indexedDB.open("/data");

  request.onerror = event => {
    console.log("Failed to connect to IndexedDB!");
  };

  request.onsuccess = async event => {
    const idb_db = event.target.result;
    try {
      const jsonObject = JSON.parse(jsonString);
      const dataTable = jsonObject.FILE_DATA;
      Object.keys(dataTable).forEach(key => {
        dataTable[key].timestamp = new Date(dataTable[key].timestamp);
        if (dataTable[key].contents) {
          dataTable[key].contents = Uint8Array.from(
            Object.values(dataTable[key].contents)
          );
        }
      });

      await IDBExportImport.importFromObject(idb_db, jsonObject);
    } catch (err) {
      console.error(err);
    }
  };
};

window.clearBuilds = () => {
  const request = indexedDB.open("/data");

  request.onerror = event => {
    console.log("Failed to connect to IndexedDB!");
  };

  request.onsuccess = async event => {
    const idb_db = event.target.result;
    try {
      await IDBExportImport.clearDatabase(idb_db);
    } catch (err) {
      console.error(err);
    }
  };
};
