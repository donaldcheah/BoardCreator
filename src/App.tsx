import { CSSProperties, useCallback, useState } from "react";

interface Tile {
    index: number
    x: number
    y: number
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
const FileNameInputStyle: CSSProperties = {
    width: '80px',
    marginLeft: '8px',
    textAlign: 'right'
}

function downloadFile(fileName: string, fileString: string, fileType: string) {
    var a = document.createElement("a");
    var file = new Blob([fileString], { type: fileType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function App() {

    const [xBoardSize, setXBoardSize] = useState(4)
    const [yBoardSize, setYBoardSize] = useState(4)
    const [currentTileGroupIndex, setCurrentTileGroupIndex] = useState(0)
    const [selectedTiles, setSelectedTiles] = useState<Tile[]>([])
    const [fileName, setFileName] = useState("Level-1")


    const onXChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setXBoardSize(Number(e.target.value))
    }, [])
    const onYChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setYBoardSize(Number(e.target.value))
    }, [])
    const onFileNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(e.target.value)
    }, [])



    const prevTileGroupIndex = useCallback(() => {
        if (currentTileGroupIndex > 0)
            setCurrentTileGroupIndex(currentTileGroupIndex - 1)
    }, [currentTileGroupIndex])

    const nextTileGroupIndex = useCallback(() => {
        setCurrentTileGroupIndex(currentTileGroupIndex + 1)
    }, [currentTileGroupIndex])

    const onClickBoard = useCallback((x: number, y: number) => {
        // console.log(x, '/', y)
        const tile = {
            index: currentTileGroupIndex,
            x, y
        }
        const foundTile = selectedTiles.find((t) => {
            return t.x === x && t.y === y
        })
        if (!foundTile) {
            //tile not found on location x,y
            //add to the list
            setSelectedTiles([...selectedTiles, tile])
        } else if (foundTile.index === currentTileGroupIndex) {
            //should deselect it, remove from list
            const filteredList = selectedTiles.filter((t) => {
                return t !== foundTile
            })
            setSelectedTiles([...filteredList])
        } else {
            //should change the index number on it
            foundTile.index = currentTileGroupIndex
            setSelectedTiles([...selectedTiles])
        }

    }, [currentTileGroupIndex, selectedTiles, setSelectedTiles])

    const exportFile = useCallback(() => {
        console.log('exportFile : ', fileName, '.json')
        //1- seperate all all tiles based on their index
        type TileMap = { [key: number]: Tile[] }
        let tileMap: TileMap = {}
        tileMap = selectedTiles.reduce<TileMap>((acc, tile) => {
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
        //2- translate all tile x and y to minimum state
        //get the smallest number from all the x
        //if smallest is 0, do nothing
        //if smallest is >0, minus all the x with the smallest number
        //repeat for y
        const allForms = Object.keys(tileMap).map((key, index) => {
            const targetTiles: Tile[] = tileMap[Number(key)]
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
            // console.log(index, ':', targetTiles, ' lowest x,y : ', lowestX, ',', lowestY, ' max x,y', maxX, ',', maxY)
            //3- loop from 0 to maxX and from 0 to maxY
            const form: Number[][] = []
            for (let ty = 0; ty <= maxY; ty++) {
                const row: Number[] = []
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

            return { form: form }
        })

        const jsonString = JSON.stringify(allForms)
        console.log(jsonString)

        downloadFile(`${fileName}.json`, jsonString, 'application/json')

    }, [fileName, selectedTiles])

    const renderBoard = useCallback(() => {
        const renderColumns = (rowIndex: number) => {
            const views = []
            for (let x = 0; x < xBoardSize; x++) {
                const targetTile = selectedTiles.find((t) => {
                    return t.x === x && t.y === rowIndex
                })
                //TODO if targetTile found
                let targetStyle = BoardButtonStyle
                if (targetTile && targetTile.index === currentTileGroupIndex) {
                    targetStyle = {
                        ...targetStyle,
                        ...BoardButtonGreenStyle
                    }
                }
                const text = targetTile ? targetTile.index : '-'
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
    }, [xBoardSize, yBoardSize, selectedTiles, currentTileGroupIndex, onClickBoard])

    return (
        <div>
            <div id='selections'>
                <p>
                    Board Size <input style={BoardSizeInputStyle} type='number' value={xBoardSize} onChange={onXChange} /> * <input style={BoardSizeInputStyle} type='number' value={yBoardSize} onChange={onYChange} />
                </p>
                <p>
                    Tile Group {currentTileGroupIndex} <button onClick={prevTileGroupIndex}>{"<"}</button><button onClick={nextTileGroupIndex}>{">"}</button>
                </p>
                <p>
                    Filled {selectedTiles.length} / {xBoardSize * yBoardSize} <button disabled={selectedTiles.length !== (xBoardSize * yBoardSize) && fileName.length > 0} onClick={exportFile}>Export</button>
                    <input style={FileNameInputStyle} type="text" value={fileName} onChange={onFileNameChange} />
                    .json
                </p>
            </div>
            <div id='board'>
                {renderBoard()}
            </div>
        </div>
    );
}

export default App;
