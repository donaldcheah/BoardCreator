import { CSSProperties, useCallback, useEffect, useState } from "react"
import { downloadFile } from './common'

import { saveData } from './data/SaveData'
import Package from '../package.json'

interface Tile {
    index: number //-1 for board, others for Coloured
    x: number
    y: number
    color?: string //string of color codes, if abcent, defaults to grey for board
}

type TileMap = { [key: number]: Tile[] }
type OutputType = {
    board: {
        position: { xIndex: number, yIndex: number }, form: (number | string)[][]
    },
    tileGroups: { form: (number | string)[][] }[]
}

enum TILE_TYPE {
    BOARD = "Board",
    COLOUR = "Colour"
}

const TileSizeInputStyle: CSSProperties = {
    width: '50px'
}
const BoardSizeInputStyle: CSSProperties = {
    width: '50px'
}
const BoardButtonStyle: CSSProperties = {
    width: '50px',
    height: '50px',
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    border: '1px solid'
}
const BoardButtonColorSelected: CSSProperties = {
    opacity: 1
}
const BoardButtonColorNotSelected: CSSProperties = {
    opacity: 0.65
}

const FileNameInputStyle: CSSProperties = {
    width: '80px',
    textAlign: 'right'
}
const ExportButtonStyle: CSSProperties = {
    marginLeft: '8px'
}
const OptionButton: CSSProperties = {
    marginBottom: '8px'
}
const OptionListStyle: CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    flexDirection: 'column'
}

//finds a target x,y tile from specified list of tiles
const findTileIn = (list: Tile[], x: number, y: number) => {
    return list.find((t) => {
        return t.x === x && t.y === y
    })
}


const DEFAULT = {
    tileSize: 24,
    xBoardSize: 30,
    yBoardSize: 20,
    currentTileGroupIndex: 0,
    currentTileGroupColor: '#ffff00',
    selectedColorTiles: [],
    selectedBoardTiles: [],
    tileType: TILE_TYPE.BOARD,
    fileName: "Level0",

}

export default function BoardCreator3() {

    const [tileSize, setTileSize] = useState(DEFAULT.tileSize)
    const [xBoardSize, setXBoardSize] = useState(DEFAULT.xBoardSize)
    const [yBoardSize, setYBoardSize] = useState(DEFAULT.yBoardSize)
    const [currentTileGroupIndex, setCurrentTileGroupIndex] = useState(DEFAULT.currentTileGroupIndex)
    const [currentTileGroupColor, setCurrentTileGroupColor] = useState(DEFAULT.currentTileGroupColor)
    const [fileName, setFileName] = useState(DEFAULT.fileName)
    const [tileType, setTileType] = useState<TILE_TYPE>(DEFAULT.tileType)

    const [selectedBoardTiles, setSelectedBoardTiles] = useState<Tile[]>(DEFAULT.selectedBoardTiles)
    const [selectedColorTiles, setSelectedColorTiles] = useState<Tile[]>(DEFAULT.selectedColorTiles)


    useEffect(() => {
        const boardData = saveData.loadBoard()
        if (boardData) {
            setXBoardSize(boardData.width)
            setYBoardSize(boardData.height)
            setTileSize(boardData.tileSize)
        } else {
            saveData.saveBoard({
                width: DEFAULT.xBoardSize,
                height: DEFAULT.yBoardSize,
                tileSize: DEFAULT.tileSize
            })
        }

        const saveFileName = saveData.loadFileName()
        if (saveFileName)
            setFileName(saveFileName)
        else
            saveData.saveFileName(DEFAULT.fileName)

        const boardTiles = saveData.loadBoardTiles()
        if (boardTiles)
            setSelectedBoardTiles([...boardTiles])
        else
            saveData.saveBoardTiles(DEFAULT.selectedBoardTiles)

        const colorTiles = saveData.loadColorTiles()
        if (colorTiles)
            setSelectedColorTiles(colorTiles)
        else
            saveData.saveColorTiles(DEFAULT.selectedColorTiles)

        console.log('load data')
    }, [])


    // changes the current tile group you are working on
    const prevTileGroupIndex = useCallback(() => {
        if (currentTileGroupIndex > 0) {
            const prevTileIndex = currentTileGroupIndex - 1
            setCurrentTileGroupIndex(prevTileIndex)
            const foundTile = selectedColorTiles.find((tile) => {
                return tile.index === prevTileIndex
            })
            if (foundTile && foundTile.color) {
                setCurrentTileGroupColor(foundTile.color)
            }
        }
    }, [currentTileGroupIndex, setCurrentTileGroupIndex, setCurrentTileGroupColor, selectedColorTiles])
    const nextTileGroupIndex = useCallback(() => {
        const nextTileIndex = currentTileGroupIndex + 1
        setCurrentTileGroupIndex(nextTileIndex)
        const foundTile = selectedColorTiles.find((tile) => {
            return tile.index === nextTileIndex
        })
        if (foundTile && foundTile.color) {
            setCurrentTileGroupColor(foundTile.color)
        }
    }, [currentTileGroupIndex, setCurrentTileGroupIndex, setCurrentTileGroupColor, selectedColorTiles])

    const onTileSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTileSize(Number(e.target.value))
        saveData.saveBoard({
            width: xBoardSize,
            height: yBoardSize,
            tileSize: Number(e.target.value)
        })
    }, [xBoardSize, yBoardSize])

    /* onXChange and onYChange are for the board size X,Y */
    const onXChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setXBoardSize(Number(e.target.value))
        saveData.saveBoard({
            width: Number(e.target.value),
            height: yBoardSize,
            tileSize: tileSize
        })
    }, [yBoardSize, tileSize])
    const onYChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setYBoardSize(Number(e.target.value))
        saveData.saveBoard({
            width: xBoardSize,
            height: Number(e.target.value),
            tileSize: tileSize
        })
    }, [xBoardSize, tileSize])
    const onColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const targetColor = e.target.value
        setCurrentTileGroupColor(targetColor)
    }, [setCurrentTileGroupColor])

    const onFileNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(e.target.value)
        saveData.saveFileName(e.target.value)
    }, [])

    const onTileTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setTileType(TILE_TYPE[e.target.value as keyof typeof TILE_TYPE])
    }, [])


    const handleClickWhenBoard = useCallback((x: number, y: number) => {
        let foundTile = findTileIn(selectedBoardTiles, x, y)

        if (!foundTile) {
            //no tile found, should add new
            const tile: Tile = {
                index: -1,
                x, y,
                color: undefined
            }
            const arr = [...selectedBoardTiles, tile]
            setSelectedBoardTiles(arr)
            saveData.saveBoardTiles(arr)
        } else {
            //if found existing tile, should deselect/remove it
            const arr = [...selectedBoardTiles.filter((t) => {
                return t !== foundTile
            })]
            setSelectedBoardTiles(arr)
            saveData.saveBoardTiles(arr)
        }

    }, [selectedBoardTiles, setSelectedBoardTiles])
    const handleClickWhenColor = useCallback((x: number, y: number) => {
        const tile: Tile = {
            index: currentTileGroupIndex,
            x, y,
            color: currentTileGroupColor
        }
        let foundTile = findTileIn(selectedColorTiles, x, y)
        if (!foundTile) {
            //no existing tile, should add to list
            const arr = [...selectedColorTiles, tile]
            setSelectedColorTiles(arr)
            saveData.saveColorTiles(arr)
        } else if (foundTile.index !== currentTileGroupIndex || foundTile.color !== currentTileGroupColor) {
            //has tile but different index or color, should replace it.
            foundTile.index = currentTileGroupIndex
            foundTile.color = currentTileGroupColor
            const arr = [...selectedColorTiles]
            setSelectedColorTiles(arr)
            saveData.saveColorTiles(arr)
        } else {
            //found same, existing tile, should deselect/remove it
            const arr = [...selectedColorTiles.filter(t => t !== foundTile)]
            setSelectedColorTiles(arr)
            saveData.saveColorTiles(arr)
        }


    }, [currentTileGroupIndex, currentTileGroupColor, selectedColorTiles, setSelectedColorTiles])

    const onClickBoard = useCallback((x: number, y: number) => {
        switch (tileType) {
            case TILE_TYPE.BOARD:
                handleClickWhenBoard(x, y)
                break
            case TILE_TYPE.COLOUR:
                handleClickWhenColor(x, y)
                break
            default:
                throw new Error(`Unhandled TileType : ${tileType}`)
        }
    }, [tileType, handleClickWhenBoard, handleClickWhenColor])

    const renderTileTypeOptions = useCallback(() => {
        const options = []
        for (let i in TILE_TYPE) {
            options.push(<option key={i}>{i}</option>)
        }
        return options
    }, [])

    const renderColourDisplay = useCallback(() => {
        if (tileType === TILE_TYPE.BOARD)
            return null

        const tiles = selectedColorTiles.filter((tile) => {
            return tile.index === currentTileGroupIndex
        })
        let colors: string[] = []
        colors = tiles.reduce((acc, tile) => {
            if (!acc.includes(tile.color as string)) {
                acc.push(tile.color as string)
            }
            return acc
        }, colors)
        const renderColorPalette = () => {
            return colors.map(clr => {
                return <div key={clr} style={{ marginLeft: '8px', width: '30px', height: '30px', backgroundColor: clr }}
                    onClick={() => {
                        setCurrentTileGroupColor(clr)
                    }}
                ></div>
            })
        }

        return <div style={{ display: 'flex', alignItems: 'center' }}>
            <p>
                Tile Group {currentTileGroupIndex} <button onClick={prevTileGroupIndex}>{"<"}</button>
                <button onClick={nextTileGroupIndex}>{">"}</button>
                <input type="color" value={currentTileGroupColor} onChange={onColorChange} />
            </p>
            <div id="colorPalette" style={{ display: 'flex' }}>
                {renderColorPalette()}
            </div>
        </div>
    }, [tileType, currentTileGroupIndex, prevTileGroupIndex, nextTileGroupIndex, onColorChange, currentTileGroupColor, setCurrentTileGroupColor, selectedColorTiles])



    const renderBoard = useCallback(() => {
        const renderColumns = (rowIndex: number) => {
            const views = []
            for (let x = 0; x < xBoardSize; x++) {

                let targetTile: Tile | undefined

                if (tileType === TILE_TYPE.BOARD) {
                    //only show the board, no color tiles
                    targetTile = findTileIn(selectedBoardTiles, x, rowIndex)
                } else {
                    //is tile-type color, should display board tiles only in abscence of color tile
                    targetTile = findTileIn(selectedColorTiles, x, rowIndex)
                    if (!targetTile)
                        targetTile = findTileIn(selectedBoardTiles, x, rowIndex)
                }


                let targetStyle = Object.assign({}, BoardButtonStyle, { width: `${tileSize}px`, height: `${tileSize}px` } as CSSProperties)

                let text = '-'

                if (targetTile)
                    if (targetTile.index === currentTileGroupIndex) {
                        //a colored tile, and is currently selected
                        text = String(targetTile.index)
                        targetStyle = {
                            ...targetStyle,
                            ...BoardButtonColorSelected,
                            ...{
                                backgroundColor: targetTile.color
                            }
                        }
                    } else if (targetTile.index === -1) {
                        //a board tile, should be grey
                        targetStyle = {
                            ...targetStyle,
                            ...{
                                backgroundColor: '#cccccc'
                            }
                        }
                    } else {
                        //a colored tile but is not selected
                        text = String(targetTile.index)
                        targetStyle = {
                            ...targetStyle,
                            ...BoardButtonColorNotSelected,
                            ...{
                                backgroundColor: targetTile.color
                            }
                        }
                    }

                views.push(<button key={x} style={targetStyle} onClick={() => onClickBoard(x, rowIndex)}>
                    {text}
                </button>)
            }
            return views
        }
        const views = []
        for (let y = 0; y < yBoardSize; y++) {
            const str = `row${y}`
            const v = <div key={str} id={str}>
                {renderColumns(y)}
            </div>
            views.push(v)
        }
        return views
    }, [xBoardSize, yBoardSize, currentTileGroupIndex, onClickBoard, tileSize, selectedBoardTiles, selectedColorTiles, tileType])


    const exportFile = useCallback(() => {
        //1- parse the board and color tiles according to their index
        let tileMap: TileMap = {}
        const tileMapReducer = (acc: TileMap, tile: Tile) => {
            const tileIndex = tile.index
            let arr = acc[tileIndex]
            if (!arr) {
                arr = [tile]
                acc[tileIndex] = arr
            } else {
                arr.push(tile)
            }
            return acc
        }
        tileMap = selectedBoardTiles.reduce<TileMap>(tileMapReducer, tileMap)
        tileMap = selectedColorTiles.reduce<TileMap>(tileMapReducer, tileMap)

        //2- normalise the number of form to 0,1
        const allForms = Object.keys(tileMap).map((key) => {
            //clones the tiles from the map so not to affect the tiles on screen
            const targetTiles = tileMap[Number(key)].map((t) => {
                return {
                    ...t
                }
            })
            let lowestX = -1
            let lowestY = -1
            let maxX = -1
            let maxY = -1
            targetTiles.forEach(tile => {
                if (lowestX === -1 || tile.x < lowestX)
                    lowestX = tile.x
                if (lowestY === -1 || tile.y < lowestY)
                    lowestY = tile.y
                if (tile.x > maxX)
                    maxX = tile.x
                if (tile.y > maxY)
                    maxY = tile.y
            })
            if (lowestX !== 0) {
                targetTiles.forEach(tile => {
                    tile.x -= lowestX
                })
                maxX -= lowestX
            }
            if (lowestY !== 0) {
                targetTiles.forEach(tile => {
                    tile.y -= lowestY
                })
                maxY -= lowestY
            }
            //3- create the form in 2D array of 0's and 1's
            const form: (number | string)[][] = []
            for (let ty = 0; ty <= maxY; ty++) {
                const row: (number | string)[] = []
                for (let tx = 0; tx <= maxX; tx++) {
                    const foundTile = targetTiles.find((tile) => {
                        return tile.x === tx && tile.y === ty
                    })
                    if (foundTile) {
                        if (foundTile.index === -1) {
                            row.push(1)
                        } else {
                            row.push(foundTile.color as string)
                        }
                    } else
                        row.push(0)
                }
                form.push(row)
            }

            if (Number(key) === -1) {
                //it is the grey board type
                return { form: form, position: { x: lowestX, y: lowestY } }
            }
            return { form: form }
        })

        let outputObject: OutputType = {
            board: {
                position: {
                    xIndex: 0,
                    yIndex: 0
                },
                form: []
            },
            tileGroups: []
        }

        outputObject = allForms.reduce((acc, obj) => {
            if (obj.position) {//is a board object
                acc.board.position.xIndex = obj.position.x
                acc.board.position.yIndex = obj.position.y
                acc.board.form = obj.form
            } else {//is a regular tile group
                acc.tileGroups.push(obj)
            }
            return acc
        }, outputObject)

        const jsonString = JSON.stringify(outputObject, null, 2)
        downloadFile(`${fileName}.json`, jsonString, 'application/json')

    }, [selectedBoardTiles, selectedColorTiles, fileName])


    const exportProjectFile = useCallback(() => {
        saveData.exportProjectFile()
    }, [])
    const importProjectFile = useCallback(() => {
        saveData.importProjectFile()
    }, [])
    const clearProject = useCallback(() => {
        if (window.confirm("This will clear saved data!\nYou should probably EXPORT PROJECT FILE first.\nConfirm clear project?")) {
            saveData.clearSave()
            const {
                xBoardSize,
                yBoardSize,
                tileSize,
                fileName,
                selectedBoardTiles,
                selectedColorTiles,
                currentTileGroupIndex,
                currentTileGroupColor,
                tileType
            } = DEFAULT
            //replaces deleted save with initial state save
            saveData.saveBoard({
                width: xBoardSize,
                height: yBoardSize,
                tileSize: tileSize
            })
            saveData.saveFileName(fileName)
            saveData.saveColorTiles(selectedColorTiles)
            saveData.saveBoardTiles(selectedBoardTiles)

            //set all default values
            setTileSize(tileSize)
            setXBoardSize(xBoardSize)
            setYBoardSize(yBoardSize)
            setCurrentTileGroupIndex(currentTileGroupIndex)
            setCurrentTileGroupColor(currentTileGroupColor)
            setSelectedColorTiles(selectedColorTiles)
            setSelectedBoardTiles(selectedBoardTiles)
            setTileType(tileType)
            setFileName(fileName)
        }
    }, [])
    return <div>
        <div id='selections'>
            <p>
                Board Size <input style={BoardSizeInputStyle} type='number' value={xBoardSize} onChange={onXChange} /> * <input style={BoardSizeInputStyle} type='number' value={yBoardSize} onChange={onYChange} />  Tile Size : <input style={TileSizeInputStyle} type='number' value={tileSize} onChange={onTileSizeChange} />
            </p>
            <p>
                <input style={FileNameInputStyle} type="text" value={fileName} onChange={onFileNameChange} />
                .json
                <button disabled={fileName.length < 1} style={ExportButtonStyle} onClick={exportFile}>Export</button>
            </p>

            <p>
                Tile Type : <select onChange={onTileTypeChange}>
                    {renderTileTypeOptions()}
                </select>
            </p>
            {renderColourDisplay()}
            {/* {renderTileGroupView()} */}

        </div>

        <div id='board'>
            {renderBoard()}
        </div>

        {/* floating options on top right */}
        <div id='optionList' style={OptionListStyle}>
            <button style={OptionButton} onClick={exportProjectFile}>Export Project File</button>
            <button style={OptionButton} onClick={importProjectFile}>Import Project File</button>
            <button style={OptionButton} onClick={clearProject}>Clear Project</button>
        </div>
        <p id='app-version' style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            opacity: '0.11',
            margin: '0px',
            userSelect: 'none'
        }}>V{Package.version}</p>
    </div>
}