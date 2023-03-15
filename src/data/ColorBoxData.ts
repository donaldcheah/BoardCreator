const COLOR_BOX_KEY = "COLOR_BOX"
class ColorBoxData {
    private colorsInBox: string[] = []
    constructor() {
        this.loadData()
    }
    addColor(colorCode: string) {
        if (!this.colorsInBox.includes(colorCode)) {
            this.colorsInBox.push(colorCode)
            this.saveData()
        }
    }
    removeColor(colorCode: string) {
        if (this.colorsInBox.includes(colorCode)) {
            this.colorsInBox.splice(this.colorsInBox.indexOf(colorCode), 1)
            this.saveData()
        }
    }
    getColorsInBox(): string[] {
        return this.colorsInBox
    }

    setColorsInBox(colorList: string[]) {
        this.colorsInBox = colorList
        this.saveData()
    }

    clearData() {
        this.colorsInBox = []
        localStorage.removeItem(COLOR_BOX_KEY)
    }

    private loadData() {
        const str = localStorage.getItem(COLOR_BOX_KEY)
        if (str) {
            this.colorsInBox = JSON.parse(str)
        }
    }
    private saveData() {
        const str = JSON.stringify(this.colorsInBox)
        localStorage.setItem(COLOR_BOX_KEY, str)
    }
}

const colorBoxData = new ColorBoxData()
export { colorBoxData }