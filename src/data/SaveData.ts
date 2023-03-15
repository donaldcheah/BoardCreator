import { Tile, downloadFile } from "../common"
import { colorBoxData } from "./ColorBoxData"

const BOARD_KEY = "BOARD"
const FILE_NAME_KEY = "FILE_NAME"
const BOARD_TILES_KEY = "BOARD_TILES"
const COLOR_TILES_KEY = "COLOR_TILES"

type BoardData = {
    width: number
    height: number
    tileSize: number
}
class SaveData {
    saveBoard(boardData: BoardData) {
        const strBoardData = JSON.stringify(boardData)
        localStorage.setItem(BOARD_KEY, strBoardData)
    }
    loadBoard(): BoardData | undefined {
        const strBoardData = localStorage.getItem(BOARD_KEY)
        let boardData: BoardData | undefined
        if (strBoardData) {
            boardData = JSON.parse(strBoardData)
        }
        return boardData
    }

    saveFileName(fileName: string) {
        localStorage.setItem(FILE_NAME_KEY, fileName)
    }
    loadFileName(): string | null {
        return localStorage.getItem(FILE_NAME_KEY)
    }

    saveColorTiles(tiles: Tile[]) {
        const str = JSON.stringify(tiles)
        localStorage.setItem(COLOR_TILES_KEY, str)
    }
    loadColorTiles(): Tile[] | undefined {
        const str = localStorage.getItem(COLOR_TILES_KEY)
        let tiles: Tile[] | undefined
        if (str) {
            tiles = JSON.parse(str)
        }
        return tiles
    }

    saveBoardTiles(tiles: Tile[]) {
        const str = JSON.stringify(tiles)
        localStorage.setItem(BOARD_TILES_KEY, str)
    }
    loadBoardTiles(): Tile[] | undefined {
        const str = localStorage.getItem(BOARD_TILES_KEY)
        let tiles: Tile[] | undefined
        if (str) {
            tiles = JSON.parse(str)
        }
        return tiles
    }



    exportProjectFile() {
        const strBoard = localStorage.getItem(BOARD_KEY)
        const strFileName = localStorage.getItem(FILE_NAME_KEY)
        const strColorTiles = localStorage.getItem(COLOR_TILES_KEY)
        const strBoardTiles = localStorage.getItem(BOARD_TILES_KEY)

        const projectFileName = `${strFileName}_${Date.now()}.boardcreator`

        let board
        if (strBoard)
            board = JSON.parse(strBoard)
        let colorTiles
        if (strColorTiles)
            colorTiles = JSON.parse(strColorTiles)
        let boardTiles
        if (strBoardTiles)
            boardTiles = JSON.parse(strBoardTiles)
        const data = {
            board,
            fileName: strFileName,
            colorTiles,
            boardTiles,
            colorBox: JSON.stringify(colorBoxData.getColorsInBox())
        }
        const strData = JSON.stringify(data)
        downloadFile(projectFileName, strData, 'text/plain')
    }
    importProjectFile() {
        this._selectJSONFile()
            .then(this._readFileAsString)
            .then(str => {
                console.log('loaded string from .json file :', str)
                const obj = JSON.parse(str)
                if (!obj.board || !obj.fileName || !obj.colorTiles || !obj.boardTiles) {
                    throw new Error("Invalid json content!")
                }
                this.saveBoard(obj.board)
                this.saveFileName(obj.fileName)
                this.saveColorTiles(obj.colorTiles)
                this.saveBoardTiles(obj.boardTiles)
                const colorBoxStr = obj.colorBox
                if (colorBoxStr) {
                    colorBoxData.setColorsInBox(JSON.parse(colorBoxStr))
                }
                alert('imported project file, reloading...')
                window.location.reload()
            }).catch(err => {
                const msg = err.message ? err.message : err
                alert(msg)
            })
    }

    clearSave() {
        localStorage.removeItem(BOARD_KEY)
        localStorage.removeItem(FILE_NAME_KEY)
        localStorage.removeItem(BOARD_TILES_KEY)
        localStorage.removeItem(COLOR_TILES_KEY)
        colorBoxData.clearData()
    }

    private _selectJSONFile(): Promise<File> {
        return new Promise((rs, rj) => {
            const element = document.createElement('input')
            element.type = 'file'
            element.accept = '.boardcreator'
            element.onchange = () => {
                console.log('files : ', element.files)
                if (element.files) {
                    const file = element.files[0]
                    rs(file)
                } else {
                    rj("didn't select any file")
                }
            }
            element.click()
        });
    }
    private _readFileAsString(f: File): Promise<string> {
        return new Promise((rs, rj) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const str = e.target?.result as string
                rs(str)
            }
            reader.onerror = (e) => {
                rj(e)
            }
            reader.readAsText(f)
        });
    }

}
const saveData = new SaveData()
export { saveData }