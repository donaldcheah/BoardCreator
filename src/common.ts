export interface Tile {
    index: number
    x: number
    y: number
}

export function downloadFile(fileName: string, fileString: string, fileType: string) {
    var a = document.createElement("a");
    var file = new Blob([fileString], { type: fileType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}