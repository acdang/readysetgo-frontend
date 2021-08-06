const workoutForm = document.querySelector('form.create-workout-form')
const workoutNameInput = document.querySelector('form.create-workout-form input#workout-name')
const blockExerciseSetForm = document.querySelector('form.create-block-set-form')
const addExerciseSetButton = document.querySelector('button#add-set')
const exerciseSetFormBlock = document.querySelector('div.set-form-block')
const exerciseSetFormContainer = document.querySelector('div.set-form-container')
const blockWorkoutSelectInput = document.querySelector('select.block-exercise-select')
const exerciseSetExerciseSelectInput = document.querySelector('select.set-exercise-select')
const workoutDisplay = document.querySelector('div.workout-display')

async function fetchWorkouts() {
    const resp = await fetch('http://127.0.0.1:3000/workouts')
    return resp.json()
}

// function fetchWorkoutById(id) {
//     return fetchWorkouts()
//     .then(workoutsArray => {
//         // debugger
//         return workoutsArray.find(workoutObj => workoutObj.id == id)
//     })
// }

async function fetchWorkoutById(id) {
    const workoutsArray = await fetchWorkouts()
    return workoutsArray.find(workoutObj => workoutObj.id == id)
}

// function fetchExercises() {
//     return fetch('http://127.0.0.1:3000/exercises')
//     .then(resp => resp.json())
// }

async function fetchExercises() {
    const resp = await fetch('http://127.0.0.1:3000/exercises')
    return resp.json()
}

// on load render placeholder/default for Workout name input field
fetchWorkouts().then(function(workoutsArray) {
    workoutNameInput.placeholder = `Workout ${workoutsArray.length + 1}`
})

// assigns default placeholder as name for new Workout (if no user-provided name)
function autoWorkoutNameValue(input) {
    // fetchWorkouts().then(function(workoutsArray) {
    //     input.value = `Workout ${workoutsArray.length + 1}`
    // })
    input.value = input.placeholder
}

// submit handling, create new Workout form
workoutForm.addEventListener('submit', function(event) {
    event.preventDefault()

    const workoutName = event.target[0]

    // assign default placeholder as new Workout name if no user-provided name
    if (workoutName.value == "") {
        autoWorkoutNameValue(workoutName)
    }
    
    // update workout name input placeholder
    const origPlaceholderNum = Number(workoutName.placeholder.match(/\d+/)[0])
    workoutName.placeholder = `Workout ${origPlaceholderNum + 1}`

    fetch('http://127.0.0.1:3000/workouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify({
            name: workoutName.value
        })
    })
    .then(response => response.json())
    .then(data => {
        // debugger
        createWorkoutOption(data) // for select input in the create Block+ExerciseSet form
        renderWorkoutDisplayCard(data)
    })

    event.target.reset() // form reset
})

// show Block/Set form if at least 1 workout exists -- NEED TO IMPLEMENT!!!!!!!!!!!
fetchWorkouts().then(function(workoutsArray) {
    if (workoutsArray.length > 0) {
        console.log("Line 74")
    }
})

// add new ExerciseSet input field blocks in the Block/ExerciseSet form
addExerciseSetButton.addEventListener('click', function() {
    const newSetFormBlock = exerciseSetFormBlock.cloneNode(true)
    
    const lineBreak = document.createElement('hr')

    exerciseSetFormContainer.appendChild(lineBreak)
    exerciseSetFormContainer.appendChild(newSetFormBlock)
})

// add option tag to select Workout input in Block/ExerciseSet form
function createWorkoutOption(workoutObject) {
    // create option
    const newOption = document.createElement('option')
    // assign name & id to option
    newOption.value = workoutObject.id
    // debugger
    newOption.textContent = workoutObject.name
    // append to select input
    blockWorkoutSelectInput.appendChild(newOption)
    // debugger
}

// on page load, render all available Workout options in Block/ExerciseSet form
// add workout options to select input in Block/ExerciseSet form
fetchWorkouts().then(function(workoutsArray) {
    workoutsArray.forEach(function(workoutObj) {
        createWorkoutOption(workoutObj)
    })
})

// create a new ExerciseSet & render ExerciseSet details in Workout display card
function createExerciseSet(inputValuesArray, blockId, exerciseSetDisplayUl) {
    const [ exerciseId, setReps, exerciseRepNum, activeTime, restTime, weight ] = inputValuesArray
    // console.log(exerciseRepNum)
    // debugger

    // create ExerciseSet
    const data = {
        exercise_id: Number(exerciseId),
        exercise_rep_num: exerciseRepNum,
        active_time: activeTime,
        rest_time: restTime,
        weight: weight,
    }
    // debugger
    fetch('http://127.0.0.1:3000/exercise_sets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        // render ExerciseSet details in Workout displaycard

        // debugger

        // create SetRepetition(s)
        const setRepData = {
            block_id: blockId,
            exercise_set_id: data.id,
        }
        // debugger
        for (let i = 0; i < setReps; i++) {
            fetch('http://127.0.0.1:3000/set_repetitions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json"
                },
                body: JSON.stringify(setRepData)
            })
            renderSet(data, exerciseSetDisplayUl)
        }
    })
    // debugger
}

// create a WorkoutBlock (association between a Workout and a Block)
function createWorkoutBlock(blockId, workoutId) {
    const workoutBlockData = {
        block_id: blockId,
        workout_id: workoutId,
    }

    fetch('http://127.0.0.1:3000/workout_blocks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify(workoutBlockData)
    })
    // .then(resp => resp.json())
    // .then(data => console.log(data))
    // debugger
}

// submit handling, create new Block & ExerciseSet(s) form
blockExerciseSetForm.addEventListener('submit', function(event) {
    event.preventDefault()

    // get array of all html input blocks that create new ExerciseSet
    const allSetFormBlocks = Array.from(event.target.querySelectorAll('div.set-form-block'))
    // for each html block in the array, extract input values into array
    const inputValuesArray = allSetFormBlocks.map(function(setFormBlock) {
        const selectInput = Number(setFormBlock.querySelector('select').value)
        const inputsArray = Array.from(setFormBlock.querySelectorAll('input'))
        const inputFields = inputsArray.map(inputElement => {
            if (inputElement.value !== "") {
                return Number(inputElement.value)
            } else {
                return null
            }
        })
        // debugger
        return [selectInput, ...inputFields]
    })
    
    // selectedWorkoutInput NEEDS to have id as value
    const [ blockNameInput, selectedWorkoutInput ] = event.target
    const selectedWorkoutId = Number(selectedWorkoutInput.value)

    fetchWorkoutById(selectedWorkoutInput.value).then(workoutObj => {
        if (blockNameInput.value === "") {
            blockName = `Exercise Block ${workoutObj.blocks.length + 1}`
        } else {
            blockName = blockNameInput.value
        }
        // debugger
        // post request -- create new Block + WorkoutBlock
        fetch('http://127.0.0.1:3000/blocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
            body: JSON.stringify({ name: blockName })
        })
        .then(response => response.json())
        .then(newBlock => {
            createWorkoutBlock(newBlock.id, selectedWorkoutId)

            // debugger

            // render Block in the associated Workout display card
            workoutCard = document.querySelector(`div.card[data-id="${selectedWorkoutId}"]`)
            renderBlock(newBlock, workoutCard)
            const exerciseSetDisplayUl = workoutCard.querySelector(`ul[data-id="${newBlock.id}"]`)

            // create an ExerciseSet for every inputted ExerciseSet html input block
            inputValuesArray.forEach(function(inputValues) {
                // debugger
                createExerciseSet(inputValues, newBlock.id, exerciseSetDisplayUl)
            })
            
        })
        // debugger
        event.target.reset() // form reset
    })
})

// !!! can prob combine this with renderWorkoutOptions() ?
// on page load, render all available Exercises in select input for create ExerciseSet
// add exercise options to select input in ExerciseSet form
fetchExercises().then(function(exercisesArray) {
    exercisesArray.forEach(function(exerciseObj) {
        createExerciseOption(exerciseObj)
    })
})

// !!! can prob combine this with createWorkoutOption() ?
// add option tag to select Exercise input in Block/ExerciseSet form
function createExerciseOption(exerciseObject) {
    // create option
    const newOption = document.createElement('option')
    // assign name & id to option
    newOption.value = exerciseObject.id
    newOption.textContent = exerciseObject.name
    // append to select input
    exerciseSetExerciseSelectInput.appendChild(newOption)
}

// render a Workout display card for a given Workout
function renderWorkoutDisplayCard(workoutObject) {
    // console.log("entered")
    // debugger
    const workoutCard = document.createElement('div')
    workoutCard.className = 'card'
    workoutCard.dataset.id =  workoutObject.id
    
    const workoutName = document.createElement('h2')
    workoutName.textContent = workoutObject.name
    workoutCard.appendChild(workoutName)

    const blocksArray = workoutObject.blocks // need to have `has_many :blocks` in Workout serializer
    // debugger
    // render each Block in current Workout
    if (blocksArray) {
        blocksArray.forEach(function(block) {
            renderBlock(block, workoutCard)
        })
    }
    // debugger
    workoutDisplay.appendChild(workoutCard)
}

// render Block details in the associated Workout display card
function renderBlock(block, workoutCard) {
    const blockName = document.createElement('h3')
    blockName.textContent = block.name

    // in each block, render container to store ExerciseSets
    const exerciseSetsDisplay = document.createElement('ul')
    exerciseSetsDisplay.dataset.id = block.id

    const exerciseSetsArray = block.exercise_sets // need to have `has_many :exercise_sets` in Block serializer
    // debugger

    // for each ExceriseSet in current Block, render its details within Block display of Workout display card
    exerciseSetsArray.forEach(function(exerciseSet) { // need to have `has_one :exercise` in ExerciseSet serializer
        // debugger
        renderSet(exerciseSet, exerciseSetsDisplay)
    })
    workoutCard.append(blockName, exerciseSetsDisplay)
}

// render display details of an ExerciseSet
function renderSet(exerciseSet, exerciseSetsDisplay) {
    const oneSetDisplay = document.createElement('li')
    oneSetDisplay.textContent = `${exerciseSet.exercise.name}, ${exerciseSet.exercise_rep_num} repetition(s)`
    exerciseSetsDisplay.appendChild(oneSetDisplay)
}

// on page load, render all Workout display cards
fetchWorkouts().then(function(workoutsArray) {
    workoutsArray.forEach(function(workoutObj) {
        renderWorkoutDisplayCard(workoutObj)
    })
    console.log("working!")
})
