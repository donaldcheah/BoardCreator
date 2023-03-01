import { CSSProperties, useCallback, useState } from "react"

type TileMap = { [key: number]: Tile[] }
type OutputType = { board: { position: { xIndex: number, yIndex: number }, form: number[][] }, tileGroups: { form: number[][] }[] }

interface Tile {
    index: number
    x: number
    y: number
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
const BoardButtonGreenStyle: CSSProperties = {
    backgroundColor: '#00ff00'
}
const BoardButtonGreyStyle: CSSProperties = {
    backgroundColor: '#cccccc'
}
const BoardButtonYellowStyle: CSSProperties = {
    backgroundColor: '#ffff00'
}
const FileNameInputStyle: CSSProperties = {
    width: '80px',
    textAlign: 'right'
}
const ExportButtonStyle: CSSProperties = {
    marginLeft: '8px'
}

function downloadFile(fileName: string, fileString: string, fileType: string) {
    var a = document.createElement("a");
    var file = new Blob([fileString], { type: fileType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

enum TILE_TYPE {
    GREY = 1,
    YELLOW = 2
}

export default function BoardCreator2() {

    const [tileSize, setTileSize] = useState(24)
    const [xBoardSize, setXBoardSize] = useState(30)
    const [yBoardSize, setYBoardSize] = useState(20)
    const [currentTileGroupIndex, setCurrentTileGroupIndex] = useState(0)

    const [selectedYellowTiles, setSelectedYellowTiles] = useState<Tile[]>([])
    const [selectedGreyTiles, setSelectedGreyTiles] = useState<Tile[]>([])

    const [tileType, setTileType] = useState<TILE_TYPE>(TILE_TYPE.GREY)

    const [fileName, setFileName] = useState("Level0")

    const onTileSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTileSize(Number(e.target.value))
    }, [])

    /* onXChange and onYChange are for the board size X,Y */
    const onXChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setXBoardSize(Number(e.target.value))
    }, [])
    const onYChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setYBoardSize(Number(e.target.value))
    }, [])

    const onFileNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(e.target.value)
    }, [])

    // Change currently operating on GREY/YELLOW tile type
    const onTileTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        var value = e.target.selectedOptions[0].value
        setTileType(TILE_TYPE[value as keyof typeof TILE_TYPE])
    }, [])

    // changes the current tile group you are working on
    const prevTileGroupIndex = useCallback(() => {
        if (currentTileGroupIndex > 0)
            setCurrentTileGroupIndex(currentTileGroupIndex - 1)
    }, [currentTileGroupIndex])
    const nextTileGroupIndex = useCallback(() => {
        setCurrentTileGroupIndex(currentTileGroupIndex + 1)
    }, [currentTileGroupIndex])

    const findTileIn = useCallback((list: Tile[], x: number, y: number) => {
        return list.find((t) => {
            return t.x === x && t.y === y
        })
    }, [])

    const handleClickWhenGrey = useCallback((x: number, y: number) => {
        const tile = {
            index: -1,
            x, y
        }
        const foundTile = findTileIn(selectedGreyTiles, x, y)
        if (!foundTile) {
            //not found tile, should be unoccupied
            setSelectedGreyTiles([...selectedGreyTiles, tile])
        } else if (foundTile.index === -1) {
            //is an existing grey tile, should deselect it
            setSelectedGreyTiles([...selectedGreyTiles.filter((t) => {
                return t !== foundTile
            })])
        } else {
            //is a yellow tile or other types, should change to grey tile
            foundTile.index = -1
            setSelectedGreyTiles([...selectedGreyTiles])
        }

    }, [selectedGreyTiles, setSelectedGreyTiles, findTileIn])

    const handleClickWhenYellow = useCallback((x: number, y: number) => {
        const tile = {
            index: currentTileGroupIndex,
            x, y
        }
        const foundTile = findTileIn(selectedYellowTiles, x, y)

        if (!foundTile) {
            //tile not found on location x,y
            //add to the list
            setSelectedYellowTiles([...selectedYellowTiles, tile])
        } else if (foundTile.index === currentTileGroupIndex) {
            //should deselect it, remove from list
            const filteredList = selectedYellowTiles.filter((t) => {
                return t !== foundTile
            })
            setSelectedYellowTiles([...filteredList])
        } else {
            //should change the index number on it
            foundTile.index = currentTileGroupIndex
            setSelectedYellowTiles([...selectedYellowTiles])
        }
    }, [currentTileGroupIndex, selectedYellowTiles, setSelectedYellowTiles, findTileIn])

    const onClickBoard = useCallback((x: number, y: number) => {
        switch (tileType) {
            case TILE_TYPE.GREY:
                handleClickWhenGrey(x, y)
                break
            case TILE_TYPE.YELLOW:
                handleClickWhenYellow(x, y)
                break
            default:
                throw new Error(`Unhandled TileType : ${tileType}`)
        }
    }, [tileType, handleClickWhenGrey, handleClickWhenYellow])

    /* Takes the GREY and YELLOW tiles and export them to a .json file */
    const exportFile2 = useCallback(() => {

        let tileMap: TileMap = {}
        tileMap = selectedGreyTiles.reduce<TileMap>((acc, tile) => {
            const tileIndex = tile.index
            let arr = acc[tileIndex]
            if (!arr) {
                arr = [tile]
                acc[tileIndex] = arr
            } else {
                arr.push(tile)
            }
            return acc
        }, tileMap)
        tileMap = selectedYellowTiles.reduce<TileMap>((acc, tile) => {
            const tileIndex = tile.index
            let arr = acc[tileIndex]
            if (!arr) {
                arr = [tile]
                acc[tileIndex] = arr
            } else {
                arr.push(tile)
            }
            return acc
        }, tileMap)
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
            const form: number[][] = []
            for (let ty = 0; ty <= maxY; ty++) {
                const row: number[] = []
                for (let tx = 0; tx <= maxX; tx++) {
                    const foundTile = targetTiles.find((tile) => {
                        return tile.x === tx && tile.y === ty
                    })
                    if (foundTile)
                        row.push(1)
                    else
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
    }, [fileName, selectedYellowTiles, selectedGreyTiles])

    const renderBoard = useCallback(() => {
        const renderColumns = (rowIndex: number) => {
            const views = []
            for (let x = 0; x < xBoardSize; x++) {

                let targetTile: Tile | undefined

                //to show the grey tiles only when is selecting tile type grey
                if (tileType === TILE_TYPE.GREY) {
                    targetTile = findTileIn(selectedGreyTiles, x, rowIndex)
                } else {
                    //to show yellow on top of grey tiles when is selecting tile type yellow
                    targetTile = findTileIn(selectedYellowTiles, x, rowIndex)
                    if (!targetTile)
                        targetTile = findTileIn(selectedGreyTiles, x, rowIndex)
                }

                let targetStyle = Object.assign({}, BoardButtonStyle, { width: `${tileSize}px`, height: `${tileSize}px` } as CSSProperties)

                let text = '-'

                if (targetTile)
                    if (targetTile.index === currentTileGroupIndex) {
                        text = String(targetTile.index)
                        targetStyle = {
                            ...targetStyle,
                            ...BoardButtonGreenStyle
                        }
                    } else if (targetTile.index === -1) {

                        targetStyle = {
                            ...targetStyle,
                            ...BoardButtonGreyStyle
                        }
                    } else {
                        text = String(targetTile.index)
                        targetStyle = {
                            ...targetStyle,
                            ...BoardButtonYellowStyle
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
    }, [xBoardSize, yBoardSize, currentTileGroupIndex, onClickBoard, tileSize, findTileIn, selectedGreyTiles, selectedYellowTiles, tileType])

    const renderTileTypeOptions = useCallback(() => {
        const options = []
        for (let i in TILE_TYPE) {
            if (typeof TILE_TYPE[i] !== 'number') {
                continue
            }
            options.push(<option key={i}>{i}</option>)
        }
        return options
    }, [])

    const renderTileGroupView = useCallback(() => {
        if (tileType === TILE_TYPE.YELLOW)
            return <p>
                Tile Group {currentTileGroupIndex} <button onClick={prevTileGroupIndex}>{"<"}</button><button onClick={nextTileGroupIndex}>{">"}</button>
            </p>

        return null
    }, [tileType, currentTileGroupIndex, nextTileGroupIndex, prevTileGroupIndex])

    return (
        <div>
            <div id='selections'>
                <p>
                    Board Size <input style={BoardSizeInputStyle} type='number' value={xBoardSize} onChange={onXChange} /> * <input style={BoardSizeInputStyle} type='number' value={yBoardSize} onChange={onYChange} />  Tile Size : <input style={TileSizeInputStyle} type='number' value={tileSize} onChange={onTileSizeChange} />
                </p>

                <p>
                    Tile Type : <select onChange={onTileTypeChange}>
                        {renderTileTypeOptions()}
                    </select>
                </p>
                {renderTileGroupView()}

                <p>
                    <input style={FileNameInputStyle} type="text" value={fileName} onChange={onFileNameChange} />
                    .json
                    <button disabled={fileName.length < 1} style={ExportButtonStyle} onClick={exportFile2}>Export</button>
                </p>
            </div>
            <div id='board'>
                {renderBoard()}
            </div>
        </div>
    );
}