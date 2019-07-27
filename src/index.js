import React from "react"
import ReactDOM from "react-dom"
import "./styles.css"
// STRUCTURE OF APP - {MAIN: {GRID: {BOX}}}
// BOX IS A CHILD COMPONENT OF GRID WHICH IS A CHILD COMPONENT OF MAIN
class Box extends React.Component {
    selectBox = () => {
        this.props.selectBox(this.props.row, this.props.col)
    }
    render() {
        return (
            <div
                className={this.props.boxClass}
                id={this.props.id}
                onClick={this.selectBox}
            />
        )
    }
}
// GRID IS A CHILD COMPONENT OF MAIN
class Grid extends React.Component {
    render() {
        // THIS.PROPS. IS USED TO REFERENCE ANY PROPERTIES WE WANT TO INHERIT FROM THE MAIN COMPONENT BELOW
        const width = this.props.cols * 16
        let rowsArr = []
        let boxClass = ""

        for (var i = 0; i < this.props.rows; i++) {
            for (var j = 0; j < this.props.cols; j++) {
                let boxId = i + "_" + j
                boxClass = this.props.gridFull[i][j] ? "box on" : "box off" // BOX ON AND BOX OFF ARE CSS STYLE CLASSES
                    rowsArr.push(
                    < Box
                        boxClass = { boxClass }
                        key = { boxId }
                        boxId = { boxId }
                        row = { i }
                        col = { j }
                        selectBox = { this.props.selectBox }
                        />
                    )
            }
        }
        return (
            <div className="grid" style={{ width: width }}> {/*FOR STYLE.CSS PURPOSES WE SET THE DIV CLASS TO "grid"*/}
                {rowsArr}
            </div>
        )
    }
}
class Buttons extends React.Component {
    // METHOD FOR CHANGING GRID SIZE, RECEIVES IN THE OPTION VALUE SELECTED BY THE DROP DOWN LIST
    handleSelect = (evt) => {
        this.props.gridSize(evt.target.value)
    }
    render() {
        return (
            <div id="buttons"> {/*ID SET FOR STYLING PURPOSES TO CENTER BUTTONS */}
                    <button onClick={this.props.playButton}>Play</button>
                    <button onClick={this.props.pauseButton}>Pause</button>
                    <button onClick={this.props.clear}>Clear</button>
                    <button onClick={this.props.slow}>Slow</button>
                    <button onClick={this.props.fast}>Fast</button>
                    <button onClick={this.props.seed}>Seed</button>
                <select
                    title="Grid Size"
                    id="size-menu"
                    onChange={this.handleSelect}
                > {/*WAIT FOR A CHANGE IN THE DROP DOWN MENU THEN SEND THE VALUE OF THE SELECTED OPTION TO THE HANDLESELECT METHOD*/}
                    <option value="1">20 x 10</option>
                    <option value="2" selected>50 x 30</option>
                    <option value="3"> 70 x 50</option>
                </select>
                
            </div >
        )
    }
}
class Main extends React.Component {
    constructor(props) {
        super(props)
        this.speed = 100
        this.rows = 30
        this.cols = 50
        this.state = {
            generation: 0,
            gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
        }
    }
    selectBox = (row, col) => {
        let gridCopy = arrayClone(this.state.gridFull) // arrayClone is a helper function defined below
        gridCopy[row][col] = !gridCopy[row][col]
        this.setState({ gridFull: gridCopy })
    }
    seed = () => {
        let gridCopy = arrayClone(this.state.gridFull)
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (Math.floor(Math.random() * 4) === 1) {
                    gridCopy[i][j] = true
                }
            }
        }
        this.setState({ gridFull: gridCopy }) // UPDATE THE GRID WITH THE RANDOM SEED
    }
    playButton = () => {
        clearInterval(this.intervalId)
        this.intervalId = setInterval(this.play, this.speed) // Every 100ms (this.speed) we will run this.play to update the game state
    }
    pauseButton = () => {
        clearInterval(this.intervalId)
    }
    slow = () => {
        this.speed = 1000
        this.playButton() // clears interval and sets new interval with new speed
    }
    fast = () => {
        this.speed = 100
        this.playButton() // clears interval and sets new interval with new speed
    }
    clear = () => {
        let blankGrid = Array(this.rows).fill().map(() => Array(this.cols).fill(false))
        this.setState({
            gridFull: blankGrid,
            generation: 0
        })
    }
    gridSize = (size) => {
        switch (size) {
            case "1":
                this.cols = 20
                this.rows = 10
                break;
            case "2":
                this.cols = 50
                this.rows = 30
                break;
            default:
                this.cols = 70
                this.rows = 50
        }
        this.clear() // reset the grid after resizing it so it doesn't still contain the old grid elements
    }
    play = () => {
        let g = this.state.gridFull // CHECK WHAT GRID IS CURRENTLY LOOKING LIKE
        let g2 = arrayClone(this.state.gridFull) // CREATE A COPY OF GRID TO UPDATE NEW GRID
            
        // GAME LOGIC FOR DETERMINING WHICH CELLS LIVE, DIE OR MULTIPLY
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let count = 0;
                if (i > 0) if (g[i - 1][j]) count++;
                if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
                if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
                if (j < this.cols - 1) if (g[i][j + 1]) count++;
                if (j > 0) if (g[i][j - 1]) count++;
                if (i < this.rows - 1) if (g[i + 1][j]) count++;
                if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
                if (i < this.rows - 1 && this.cols - 1) if (g[i + 1][j + 1]) count++;
                if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false; // DIES
                if (!g[i][j] && count === 3) g2[i][j] = true; // REBORN
                }
        }
        
            this.setState({
                gridFull: g2,
                generation: this.state.generation + 1
            });
        }
    // LIFECYCLE HOOK - Method that runs when everything loads
    componentDidMount() {
        this.seed()
        this.playButton()
    }
    render() {
        return (
            <div>
                <h1>JavaScript Game of Life</h1>
                <Buttons
                    playButton={this.playButton}
                    pauseButton={this.pauseButton}
                    slow={this.slow}
                    fast={this.fast}
                    clear={this.clear}
                    seed={this.seed}
                    gridSize={this.gridSize}
                    />
                <Grid 
                    gridFull={this.state.gridFull} // THESE ARE REACT PROPERTIES BEING SENT ANYWHERE THE GRID COMPONENT IS CALLED
                    rows={this.rows}
                    cols={this.cols}
                    selectBox={this.selectBox}
                />
                <h2>Generations: {this.state.generation}</h2>
            </div>
        )
    }
}
// HELPER FUNCTION FOR DEEP CLONING ARRAYS
function arrayClone(arr) {
    return JSON.parse(JSON.stringify(arr))
}
ReactDOM.render(<Main />, document.getElementById("root"))
