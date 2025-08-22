export function useFileHandler() {

  function exportDataAsJson(data, filename = 'stundenplan.json') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importDataFromJson() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const parsedData = JSON.parse(e.target.result);
            resolve(parsedData);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = (error) => {
          reject(error);
        };
        
        reader.readAsText(file);
      };

      input.click();
    });
  }

  return {
    exportDataAsJson,
    importDataFromJson
  };
}