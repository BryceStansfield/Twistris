//// Instantiating an empty grid
const grid_width = 10
const grid_height = 24

// Grid key: 0-> empty, 1,..,#tetriminos = filled with a tetrimino of that colour
tet_grid = []
reset_tet_grid()
function reset_tet_grid(){
    tet_grid = []
    for(var y = 0; y < 24; y+=1){
        tet_grid.push([])
        for(var x = 0; x < 10; x+=1){
            tet_grid[y].push(0)
        }
    }
}


const colour_map = {1:"purple", 2:"blue", 3:"red", 4:"green", 5:"orange", 6:"yellow", 7:"aqua"}

//// Tetrimino types & rotations
//tetriminos[t][r][y][x] is whether or not a piece (x,y) from our current position is part of rotation r of tetrimino t
tetriminos = [[ // L block
    [[0,0,0,0],
     [1,1,1,1],
     [0,0,0,0],
     [0,0,0,0]],
    [[0,0,1,0],
     [0,0,1,0],
     [0,0,1,0],
     [0,0,1,0]],
    [[0,0,0,0],
     [0,0,0,0],
     [1,1,1,1],
     [0,0,0,0]],
    [[0,1,0,0],
     [0,1,0,0],
     [0,1,0,0],
     [0,1,0,0]]
    ],
    [ // left facing j 
    [[1,0,0],
     [1,1,1],
     [0,0,0]],
    [[0,1,1],
     [0,1,0],
     [0,1,0]],
    [[0,0,0],
     [1,1,1],
     [0,0,1]],
    [[0,1,0],
     [0,1,0],
     [1,1,0]]
    ],
    [ // Right facing j block
    [[0,0,1],
     [1,1,1],
     [0,0,0]],
    [[0,1,0],
     [0,1,0],
     [0,1,1]],
    [[0,0,0],
     [1,1,1],
     [1,0,0]],
    [[1,1,0],
     [0,1,0],
     [0,1,0]]
    ],
    [ //square block
    [[1,1],
     [1,1]],
    [[1,1],
     [1,1]],
    [[1,1],
     [1,1]],
    [[1,1],
     [1,1]]
    ],
    [ // 1st s block
    [[0,1,1],
     [1,1,0],
     [0,0,0]],
    [[0,1,0],
     [0,1,1],
     [0,0,1]],
    [[0,0,0],
     [0,1,1],
     [1,1,0]],
    [[1,0,0],
     [1,1,0],
     [0,1,0]]
    ],
    [ // t block
    [[0,1,0],
     [1,1,1],
     [0,0,0]],
    [[0,1,0],
     [0,1,1],
     [0,1,0]],
    [[0,0,0],
     [1,1,1],
     [0,1,0]],
    [[0,1,0],
     [1,1,0],
     [0,1,0]]
    ],
    [ // 2nd s block
    [[1,1,0],
     [0,1,1],
     [0,0,0]],
    [[0,0,1],
     [0,1,1],
     [0,1,0]],
    [[0,0,0],
     [1,1,0],
     [0,1,1]],
    [[0,1,0],
     [1,1,0],
     [1,0,0]]
    ]
]
// Where does tetrimino i start at when spawned?
tetrimino_start = [[4,-1],[4,-1],[4,-1],[4,-1],[4,-1],[4,-1],[4,-1]]

//// Grabbing the neccessary canvas context, and starting the game
window.onload = function(){
    // Grabbing the canvas
    canvas = document.getElementById("twistris canvas")
    ctx = canvas.getContext("2d")
    
    // Making sure the game can start
    document.getElementById("game starter").addEventListener("click",function(){
        start_game()
    },false)
}


////// MAIN GAME LOOP
game_going = false

function start_game(){
    // Sets up the game to be started
    reset_tet_grid()
    active_keys = ["KeyS", "KeyA", "KeyD", "KeyW"]
    game_going = true
    lines_solved = 0
    current_piece = Math.floor(Math.random()*7)
    current_pos = [tetrimino_start[current_piece][0], tetrimino_start[current_piece][1]]
    gameloop()
}

function delta_t(){
    return 400**((99/100)**Math.floor(lines_solved/10))
}

function gameloop(){
    if(game_going){
        // Read instructions, update, then draw
        update_game()
        draw_state()
        setTimeout(gameloop, delta_t())
    }
}

////// Game State + updaters
current_piece = 0
current_rot = 0
lines_solved = 0
controls_changed = false
// x,y of top left corner
current_pos = [0,0]

//// Instantly rotate the current piece and redraw the canvas
function rotate(){
    if(is_valid(current_piece, (current_rot+1)%4, current_pos[0], current_pos[1])){
        current_rot = (current_rot+1)%4
        draw_state()
    }
}

//// Move and update the game state
function update_game(){
    /// Checking if we can move down, and if not, placing the piece onto the board, and drawing a new piece
    if(!is_valid(current_piece, current_rot, current_pos[0], current_pos[1]+1)){
        place_cur_piece()
        return
    }
    else{
        current_pos[1] += 1
    }

    // And finally, draw before returning
    draw_state()
    return
}

//// Change keyboard controls
function change_controls(){
    // Choose a random key to change
    var changing_key = Math.floor(Math.random()*4)

    // We're using a while loop since it's technically possible for up to 2 pieces to not be able to move, so if all possible movements fail we move onto another key
    for(var temp = 0; temp < 4; temp += 1){
        var cur_key_pos = [key_to_map[active_keys[changing_key]][0], key_to_map[active_keys[changing_key]][1]]
        var direction = Math.floor(Math.random()*4)
        for(var dir_delta = 0; dir_delta < 4; dir_delta += 1){
            // Converting the direction into a 2d object we can actually work with
            var magnitude = (-1)**(direction)
            if(direction <= 1){ // Horizontal
                var candidate_key_pos = [cur_key_pos[0] + magnitude, cur_key_pos[1]]
            }
            else{
                var candidate_key_pos = [cur_key_pos[0], cur_key_pos[1] + magnitude]
            }


            // Is this move valid?
            if(valid_key_move(candidate_key_pos)){
                active_keys[changing_key] = keyboard_map[candidate_key_pos[0]][candidate_key_pos[1]]
                return
            }

            // This failed? Ok, let's try another direction
            direction = (direction+1)%4
        }
    }

    ErrorEvent("NO KEYS WERE ABLE TO MOVE, THIS SEEMS WRONG")
}

// Is a keyboard move valid?
function valid_key_move(cand_pos){
    // Is this position even on the keyboard?
    if(cand_pos[0] >= keyboard_map.length || cand_pos[0] < 0){
        return false
    }
    if(cand_pos[1] >= keyboard_map[0].length || cand_pos[1] < 0){
        return false
    }

    // But is this key already taken?
    var key = keyboard_map[cand_pos[0]][cand_pos[1]]
    for(var i = 0; i < active_keys.length; i += 1){
        if(active_keys[i] == key){
            return false
        }
    }

    return true
}

// Placing a piece on the board, spawning a new piece to control, and checking if an lines are cleared
function place_cur_piece(){
    // Placing the piece
    for(x = 0; x < tetriminos[current_piece][current_rot][0].length; x += 1){
        for(y = 0; y < tetriminos[current_piece][current_rot].length; y += 1){
            if(tetriminos[current_piece][current_rot][y][x] == 1){
                tet_grid[current_pos[1]+y][current_pos[0]+x] = current_piece+1
            }
        }
    }

    //// Checking if any lines have been cleared (this is inefficient but works, so whatever)
    drop_distance = new Array(24).fill(0);      // How far will we drop line y in the end
    // Checking all rows
    for(var y = 23; y >= 0; y-=1){
        // Is row y full?
        row_full = true
        for(var x=0; x<10; x+=1){
            if(tet_grid[y][x] == 0){
                row_full = false
            }
        }

        // If row y is full, then clear it, and setup all future rows to fall
        if(row_full){
            lines_solved += 1
            if(lines_solved % 10 == 0){
                controls_changed = true
            }
            for(var x=0; x<10; x+=1){
                tet_grid[y][x] = 0
            }

            for(var y2 = 0; y2 < y; y2 += 1){
                drop_distance[y2] += 1
            }
        }
    }

    // Are we changing controls?
    if(controls_changed){
        change_controls()
    }

    // Dropping rows
    for(var y = 23; y >= 0; y -= 1){
        if(drop_distance[y] > 0){
            for(var x = 0; x < 10; x += 1){
                tet_grid[y+drop_distance[y]][x] = tet_grid[y][x]
                tet_grid[y][x] = 0
            }
        }
    }

    // Spawning a new piece
    current_piece = Math.floor(Math.random()*7)
    current_pos = [tetrimino_start[current_piece][0], tetrimino_start[current_piece][1]]
    current_rot = 0

    if(is_valid(current_piece, current_rot, current_pos[0], current_pos[1])){
        return
    }
    else{
        game_going = false
    }
    game_going = false
    draw_state()
    return
}

// Check if tetrimino t in rotation r with a top left corner at (x,y) is valid
function is_valid(t,r,x,y){
    // Check for any invalidating position
    for(var x2 = 0; x2 < tetriminos[t][r][0].length; x2 += 1){
        for(var y2 = 0; y2 < tetriminos[t][r].length; y2 += 1){
            if(tetriminos[t][r][y2][x2] == 1){
                if(x+x2 < 0 || x + x2 >= 10 || y+y2 >= 24){
                    return false
                }
                if(y+y2 >= 0 && tet_grid[y+y2][x+x2] != 0){
                    return false
                }
            }
        }
    }
    return true
}

//// GAME STATE DRAWER
function draw_state(){
    // Not sure whether we should do this every frame or not?
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //// Drawing the grid
    // Vertical
    for(var x = 0; x<=300; x+=30){
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,720);
        ctx.stroke();
    }

    // Horizontal
    for(var y = 0; y<=720; y+=30){
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(300,y);
        ctx.stroke();
    }

    //// Adding the blocks
    // Fixed blocks
    for(var x = 0; x < 10; x += 1){
        for(var y = 0; y < 24; y += 1){
            if(tet_grid[y][x] >= 1){
                ctx.fillStyle=colour_map[tet_grid[y][x]]
                ctx.fillRect(x*30+1, y*30+1, 28, 28)
            }
        }
    }

    // Current tetrimino
    ctx.fillStyle=colour_map[current_piece+1]
    for(var x = 0; x < tetriminos[current_piece][current_rot][0].length; x += 1){
        for(var y = 0; y < tetriminos[current_piece][current_rot].length; y += 1){
            if(tetriminos[current_piece][current_rot][y][x] == 1){
                ctx.fillRect((current_pos[0]+x)*30+1, (current_pos[1]+y)*30+1, 28, 28)
            }
        }
    }

    //// Drawing controls and score on screen:
    titles = ["Lines solved:", "Left:", "Right:", "Drop:", "Rotate:"]
    content = [lines_solved, active_keys[1], active_keys[2], active_keys[0], active_keys[3]]
    ctx.fillStyle = "black"
    ctx.font = "15px comic sans"
    for(var y = 0; y < titles.length; y += 1){
        ctx.fillText(titles[y], 325, (2*y+1)*25)
        ctx.fillText(content[y], 325, (2*y+1.5)*25)
    }

    //// Special commands
    if(game_going == false){
        ctx.fillStyle = "black"
        ctx.font = "30px comic sans"
        ctx.fillText("GAME OVER", 50, 250)
    }
    else if(controls_changed){
        ctx.fillStyle = "black"
        ctx.font = "30px comic sans"
        ctx.fillText("CONTROLS CHANGED", 50, 250)
        controls_changed = false
    }
}


////// INPUT HANDLER
//// Keyboard map, so we know which keys are adjacent, and so we can change keys around
const keyboard_map = [['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal'],
                      ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'],
                      ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'],
                      ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash']]

//// Shows which key (representated as a keycode) does each action
// 0->drop,1->left,2->right,3->rotate
active_keys = ["KeyS", "KeyA", "KeyD", "KeyW"]

// Map from a keyboard code back into the keyboard map
key_to_map = {}
for(y=0; y<keyboard_map.length; y+=1){
    for(x=0; x<keyboard_map[y].length; x+=1){
        key_to_map[keyboard_map[y][x]] = [y,x]
    }
}

//// Actual keyboard functions
is_key_down = {}
window.onkeydown = function(e){
    //// Keep track of key
    is_key_down[e.code] = true

    //// Don't do anything if the game isn't running
    if(game_going == false){
        return
    }

    //// Movement
    // Do we rotate?
    if(e.code == active_keys[3]){
        rotate()
        return
    }

    // Do we move horizontally
    // Left
    if(e.code == active_keys[1]){
        if(is_valid(current_piece, current_rot, current_pos[0]-1, current_pos[1])){
            current_pos[0] -= 1
            draw_state()
            return
        }
    }
    // Right
    else if(e.code == active_keys[2]){
        if(is_valid(current_piece, current_rot, current_pos[0]+1, current_pos[1])){
            current_pos[0] += 1
            draw_state()
            return
        }
    }

    // Do we drop as far as possible?
    if(e.code == active_keys[0]){
        while(is_valid(current_piece, current_rot, current_pos[0], current_pos[1]+1)){
            current_pos[1] += 1
        }
        place_cur_piece()
        draw_state()
    }

}

window.onkeyup = function(e){
    //// Keep track of key
    is_key_down[e.code] = false
}