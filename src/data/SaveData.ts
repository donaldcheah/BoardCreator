import { Tile, downloadFile } from "../common"

/*
{
    board:{
        width:number,
        height:number,
        tileSize:number
    },
    fileName:String,
    yellowTiles:[
        {
            index:number,
            x:number,
            y:number
        }
    ],
    greyTiles:[
        {
            index:number,
            x:number,
            y:number
        }
    ]
}
*/
const BOARD_KEY = "BOARD"
const FILE_NAME_KEY = "FILE_NAME"
const YELLOW_TILES_KEY = "YELLOW_TILES"
const GREY_TILES_KEY = "GREY_TILES"
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

    saveYellowTiles(tiles: Tile[]) {
        const str = JSON.stringify(tiles)
        localStorage.setItem(YELLOW_TILES_KEY, str)
    }
    loadYellowTiles(): Tile[] | undefined {
        const str = localStorage.getItem(YELLOW_TILES_KEY)
        let tiles: Tile[] | undefined
        if (str) {
            tiles = JSON.parse(str)
        }
        return tiles
    }

    saveGreyTiles(tiles: Tile[]) {
        const str = JSON.stringify(tiles)
        localStorage.setItem(GREY_TILES_KEY, str)
    }
    loadGreyTiles(): Tile[] | undefined {
        const str = localStorage.getItem(GREY_TILES_KEY)
        let tiles: Tile[] | undefined
        if (str) {
            tiles = JSON.parse(str)
        }
        return tiles
    }

    exportProjectFile() {
        const strBoard = localStorage.getItem(BOARD_KEY)
        const strFileName = localStorage.getItem(FILE_NAME_KEY)
        const strYellowTiles = localStorage.getItem(YELLOW_TILES_KEY)
        const strGreyTIles = localStorage.getItem(GREY_TILES_KEY)

        const projectFileName = `${strFileName}_${Date.now()}.boardcreator`

        let board
        if (strBoard)
            board = JSON.parse(strBoard)
        let yellowTiles
        if (strYellowTiles)
            yellowTiles = JSON.parse(strYellowTiles)
        let greyTiles
        if (strGreyTIles)
            greyTiles = JSON.parse(strGreyTIles)
        const data = {
            board,
            fileName: strFileName,
            yellowTiles,
            greyTiles
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
                if (!obj.board || !obj.fileName || !obj.yellowTiles || !obj.greyTiles) {
                    throw new Error("Invalid json content!")
                }
                this.saveBoard(obj.board)
                this.saveFileName(obj.fileName)
                this.saveYellowTiles(obj.yellowTiles)
                this.saveGreyTiles(obj.greyTiles)
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
        localStorage.removeItem(YELLOW_TILES_KEY)
        localStorage.removeItem(GREY_TILES_KEY)
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