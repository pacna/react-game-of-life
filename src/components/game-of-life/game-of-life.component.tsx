// React
import React, { 
    ReactElement, 
    useState, 
    ChangeEvent, 
    FormEvent, 
    useEffect,
    useRef
} from 'react';

// Material UI
import { 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    FormHelperText,
    ButtonGroup,
    Button
} from '@material-ui/core';

// Other
import { GameOfLifeStyles } from './game-of-life.styles';
import { IClasses } from './game-of-life.interfaces';
import { Grid } from '../grid/grid.component';
import { GridSize } from './grid-size';
import { CELLSTATE } from '../cell/cell.component';

export enum COMMAND {
    paused = 'paused',
    resume = 'resume',
    autoplay = 'autoplay'
}

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 370
        },
    }
};

export const GameOfLife = (): ReactElement => {
    const [command, setCommand] = useState('');
    const [row, setRow] = useState('');
    const [column, setColumn] = useState('');
    const [generation, setGeneration] = useState([] as number[][])
    
    let autoGeneration: any = useRef(null);
    const classes: IClasses = GameOfLifeStyles();

    const clearGrid = (): void => {
        setCommand(COMMAND.resume);
        const deadGeneration: number[][] = generation.map((cells: number[]) => {
            return cells.map(() => 0);
        })

        setGeneration(deadGeneration);
    }

    const updateRow = (event: ChangeEvent<{ value: unknown }>): void => {
        const newRowValue = event.target.value as string;
        setRow(newRowValue);
    }

    const updateColumn = (event: ChangeEvent<{ value: unknown }>): void => {
        const newColumnValue = event.target.value as string;
        setColumn(newColumnValue);
    }

    const createGrid = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        let firstGeneration: number[][] = [];
        for(let i = 0; i < Number(row); i++) {
            firstGeneration.push([]);
            for(let j = 0; j < Number(column); j++) {
                firstGeneration[i].push(setRandomCellState());
            }
        }

        setGeneration(firstGeneration);
    }

    const setRandomCellState = (): number => {
        return Math.round(Math.random()) // return either 0 or 1
    }

    const nextGeneration = (): void => {
        if (command === COMMAND.paused) {
            return;
        }

        const nextGeneration: number[][] = generation.map((cells: number[], i: number) => {
            return cells.map((cell: number, j: number) => {
                let aliveCount: number = 0;

                // left neighbor
                if (isWithinRange(i, j-1)) {
                    const leftNeighbor: number = generation[i][j-1];
                    if (leftNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }
                // right neighbor
                if (isWithinRange(i, j+1)) {
                    const rightNeighbor: number = generation[i][j+1];
                    if(rightNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }
                // top neighbor
                if (isWithinRange(i-1, j)) {
                    const topNeighbor: number = generation[i-1][j];
                    if(topNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }
                // down neighbor
                if (isWithinRange(i+1, j)) {
                    const downNeighbor: number = generation[i+1][j];
                    if(downNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }
                // top left neighbor
                if(isWithinRange(i-1, j-1)) {
                    const topLeftNeighbor: number = generation[i-1][j-1];
                    if (topLeftNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }
                // top right neighbor
                if(isWithinRange(i-1, j+1)) {
                    const topRightNeighbor: number = generation[i-1][j+1];
                    if (topRightNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }
                // bottom left neighbor
                if (isWithinRange(i+1, j-1)) {
                    const bottomLeftNeighbor: number = generation[i+1][j-1];
                    if (bottomLeftNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }
                // bottom right neighbor
                if (isWithinRange(i+1, j+1)) {
                    const bottomRightNeighbor: number = generation[i+1][j+1];
                    if( bottomRightNeighbor === CELLSTATE.alive) {
                        aliveCount++;
                    }
                }

                return applyGameOfLifeRules(aliveCount, cell);
            })
        })

        setGeneration(nextGeneration);
    }

    const applyGameOfLifeRules = (aliveCount: number, cell: number): number => {
        if (cell === CELLSTATE.alive) {
            if (aliveCount === 2 || aliveCount === 3) {
                return CELLSTATE.alive;
            } else {
                return CELLSTATE.dead;
            }
        } else {
            if (aliveCount === 3) {
                return CELLSTATE.alive;
            } else {
                return CELLSTATE.dead;
            }
        }
    }

    const isWithinRange = (row: number, column: number): boolean => {
        if((row >= 0 && row < generation.length) && (column >= 0 && column < generation[0].length)) {
            return true;
        } else {
            return false;
        }
    }

    const play = (): void => {
        setCommand(COMMAND.resume);
        nextGeneration();
    }

    useEffect(() => {
        if (command === COMMAND.autoplay) {
            autoGeneration = setTimeout(() => {
                nextGeneration()
            }, 500);
        }
    }, [command, nextGeneration])


    useEffect(() => {
        if (command === COMMAND.paused) {
            clearTimeout(autoGeneration);
        }
    })

    return(
        <div className={classes.center}>
            <div className={classes.marginTop4vhSpacing}>
                <ButtonGroup variant="contained" color="primary">
                    <Button onClick={clearGrid}> Clear </Button>
                    <Button onClick={play}> Next Generation </Button>
                    <Button onClick={() => setCommand(COMMAND.paused)}> Pause </Button>
                    <Button onClick={() => setCommand(COMMAND.autoplay)}> Autoplay </Button>
                </ButtonGroup>
            </div>
            <form className={classes.formContainer} onSubmit={createGrid}>
                <FormControl color="secondary" required className={classes.formControl}>
                    <InputLabel>Row</InputLabel>
                    <Select
                        value={row} 
                        onChange={updateRow}
                        MenuProps={MenuProps}
                    >
                        {
                            GridSize.map((x: number) => {
                                return(
                                    <MenuItem key={x} value={x}> {x} </MenuItem>
                                )
                            })
                        }
                    </Select>
                    <FormHelperText>Pick {GridSize[0]} - {GridSize.length} </FormHelperText>
                </FormControl>
                <FormControl color="secondary" required className={classes.formControl}>
                    <InputLabel>Column</InputLabel>
                    <Select
                        value={column}
                        onChange={updateColumn}
                        MenuProps={MenuProps}>
                        {
                            GridSize.map((x: number, i: number) => {
                                return(
                                    <MenuItem key={i} value={x}> {x} </MenuItem>
                                )
                            })
                        }
                    </Select>
                    <FormHelperText>Pick {GridSize[0]} - {GridSize.length}</FormHelperText>
                </FormControl>
                <Button type="submit" variant="contained" color="secondary">Generate</Button>
            </form>
            <div className={classes.gridContainer}>
                <Grid 
                    generation={generation}
                    command={command}
                    setCommand={setCommand}
                    />
            </div>
        </div>
    )
}