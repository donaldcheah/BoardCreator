import { CSSProperties, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { colorBoxData } from "../data/ColorBoxData"


const toHex = (base10Num: number, digits: number) => {
    let str = base10Num.toString(16)
    while (str.length < digits) {
        str = `0${str}`
    }
    return str
}

const NumInputStyle: CSSProperties = {
    width: '50px'
}

export default function ColorBox() {

    const navigate = useNavigate()
    const [red, setRed] = useState(0)
    const [green, setGreen] = useState(0)
    const [blue, setBlue] = useState(0)
    const [colorList, setColorList] = useState<string[]>(colorBoxData.getColorsInBox())


    const previewColorCode = `#${toHex(red, 2)}${toHex(green, 2)}${toHex(blue, 2)}`

    const onChangeRed = (e: React.ChangeEvent<HTMLInputElement>) => {
        let num = Number(e.target.value)
        if (num > 255) {
            num = 255
        } else if (num < 0) {
            num = 0
        }
        setRed(num)
    }
    const onChangeGreen = (e: React.ChangeEvent<HTMLInputElement>) => {
        let num = Number(e.target.value)
        if (num > 255) {
            num = 255
        } else if (num < 0) {
            num = 0
        }
        setGreen(num)
    }
    const onChangeBlue = (e: React.ChangeEvent<HTMLInputElement>) => {
        let num = Number(e.target.value)
        if (num > 255) {
            num = 255
        } else if (num < 0) {
            num = 0
        }
        setBlue(num)
    }

    const onAddColor = useCallback(() => {
        console.log('onAddColor: colorList:', colorList, ' previewColorCode:', previewColorCode)
        if (!colorList.includes(previewColorCode)) {
            // colorBoxData.addColor(previewColorCode)
            console.log('preAdd:', colorList)
            const arr = [...colorList, previewColorCode]
            console.log('postAdd', arr)
            setColorList(arr)
            colorBoxData.addColor(previewColorCode)
        }
    }, [colorList, setColorList, previewColorCode])
    const removeColor = useCallback((colorRemove: string) => {
        setColorList(colorList.filter(c => c !== colorRemove))
        colorBoxData.removeColor(colorRemove)
    }, [colorList, setColorList])

    const renderColorList = useCallback(() => {

        return colorList.map((str => {
            return <div key={str} style={{
                width: '32px',
                height: '32px',
                backgroundColor: str,
                marginLeft: '8px',
                cursor: 'pointer'
            }} onClick={() => {
                removeColor(str)
            }}></div>
        }))
    }, [colorList, removeColor])



    return <div >
        <button onClick={() => navigate(-1)}>Go Back</button>
        <div id="previewColor" style={{
            width: '64px',
            height: '64px',
            backgroundColor: previewColorCode
        }}></div>
        <div>
            <label>Red : </label>
            <input type="number" placeholder="0-255" min={0} max={255} style={NumInputStyle} value={red} onChange={onChangeRed} />
            <input type="range" min={0} max={255} value={red} onChange={(e) => setRed(Number(e.target.value))} />
            <br />

            <label>Green : </label>
            <input type="number" placeholder="0-255" min={0} max={255} style={NumInputStyle} value={green} onChange={onChangeGreen} />
            <input type="range" min={0} max={255} value={green} onChange={(e) => setGreen(Number(e.target.value))} />

            <br />
            <label>Blue : </label>
            <input type="number" placeholder="0-255" min={0} max={255} style={NumInputStyle} value={blue} onChange={onChangeBlue} />
            <input type="range" min={0} max={255} value={blue} onChange={(e) => setBlue(Number(e.target.value))} />
        </div>
        <button onClick={onAddColor}>Add Color {previewColorCode}</button>
        <div id="colorList">
            {/* List of added colors.
             shows color code on hover and with a 'X' button on top right for deleting */}
            <p>Colors Added (Click to remove)</p>
            <div style={{
                display: 'flex'
            }}>
                {renderColorList()}
            </div>
        </div>
    </div>
}