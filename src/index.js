const workoutForm = document.querySelector('form.create-workout-form')
const workoutNameInput = document.querySelector('form.create-workout-form input#workout-name')
const blockExerciseSetForm = document.querySelector('form.create-block-set-form')
const addExerciseSetButton = document.querySelector('button#add-set')
const exerciseSetFormBlock = document.querySelector('div.set-form-block')
const exerciseSetFormContainer = document.querySelector('div.set-form-container')
const blockWorkoutSelectInput = document.querySelector('select.block-exercise-select')
const exerciseSetExerciseSelectInput = document.querySelector('select.set-exercise-select')
const workoutDisplay = document.querySelector('div.workout-display')

function fetchWorkouts() {
    return fetch('http://127.0.0.1:3000/workouts')
    .then(resp => resp.json())
}

function fetchExercises() {
    return fetch('http://127.0.0.1:3000/exercises')
    .then(resp => resp.json())
}

function getWorkoutPlaceholder() {
    fetchWorkouts().then(function(workoutsArray) {
        workoutNameInput.placeholder = `Workout ${workoutsArray.length + 1}`
    })
}
getWorkoutPlaceholder()

function autoWorkoutNameValue(input) {
    // fetchWorkouts().then(function(workoutsArray) {
    //     input.value = `Workout ${workoutsArray.length + 1}`
    // })
    input.value = input.placeholder
}

workoutForm.addEventListener('submit', function(event) {
    event.preventDefault()

    const workoutName = event.target[0]

    if (workoutName.value == "") {
        autoWorkoutNameValue(workoutName)
    }
    
    // update placeholder
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
        createWorkoutOption(data)
        renderWorkoutDisplayCard(data)
    })
    
    // add newest workout to workout options in Block form select input
    // fetchWorkouts().then(function(workoutsArray) {
    //     const newestWorkoutObj = workoutsArray[workoutsArray.length - 1]
    //     createWorkoutOption(newestWorkoutObj)
    // })

    event.target.reset()
})

// show Block/Set form if at least 1 workout exists
fetchWorkouts().then(function(workoutsArray) {
    if (workoutsArray.length > 0) {
        console.log("Line 74")
    }
})

// add new exercise sets in the Block/ExerciseSet form
addExerciseSetButton.addEventListener('click', function() {
    const newSetFormBlock = exerciseSetFormBlock.cloneNode(true)
    
    const lineBreak = document.createElement('hr')

    exerciseSetFormContainer.appendChild(lineBreak)
    exerciseSetFormContainer.appendChild(newSetFormBlock)
})

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

// on page load
function renderWorkoutOptions() {
    // add workout options to select input in Block form
    fetchWorkouts().then(function(workoutsArray) {
        workoutsArray.forEach(function(workoutObj) {
            createWorkoutOption(workoutObj)
        })
    })
}
renderWorkoutOptions()

function createExerciseSet(inputValuesArray, blockId) {
    // const selectInput = htmlExerciseSetFormBlock.querySelector('select')
    // const inputsArray = Array.from(htmlExerciseSetFormBlock.querySelectorAll('input'))
    // const inputValuesArray = inputsArray.map(inputElement => inputElement.value )
    const [ exerciseId, setReps, exerciseRepNum, activeTime, restTime, weight ] = inputValuesArray
    // console.log(exercise_rep_num)

    // create Set
    // debugger
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
        }
    })
    // debugger
}

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

blockExerciseSetForm.addEventListener('submit', function(event) {
    event.preventDefault()

    // get array of all ExerciseSet html formblocks 
    const allSetFormBlocks = Array.from(event.target.querySelectorAll('div.set-form-block'))
    // for each formblock in the array, create array of input values
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

    // post request -- create new Block + WorkoutBlock
    fetch('http://127.0.0.1:3000/blocks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify({ name: blockNameInput.value })
    })
    .then(response => response.json())
    .then(newBlock => {
        // debugger
        const selectedWorkoutId = Number(selectedWorkoutInput.value)
        createWorkoutBlock(newBlock.id, selectedWorkoutId)

        // debugger

        // create an exercise set for every ExerciseSet formblock
        inputValuesArray.forEach(function(inputValues) {
            // debugger
            createExerciseSet(inputValues, newBlock.id)
        })

        workoutCard = document.querySelector(`div.card[data-a="${selectedWorkoutId}"]`)
        renderBlock(newBlock, workoutCard)
    })
    // debugger
    event.target.reset()
})

// can prob combine this with renderWorkoutOptions() ?
// on page load
function renderExerciseOptions() {
    // add exercise options to select input in ExerciseSet form
    fetchExercises().then(function(exercisesArray) {
        exercisesArray.forEach(function(exerciseObj) {
            createExerciseOption(exerciseObj)
        })
    })
}
renderExerciseOptions()

// can prob combine this with createWorkoutOption() ?
function createExerciseOption(exerciseObject) {
    // create option
    const newOption = document.createElement('option')
    // assign name & id to option
    newOption.value = exerciseObject.id
    newOption.textContent = exerciseObject.name
    // append to select input
    exerciseSetExerciseSelectInput.appendChild(newOption)
}

function renderWorkoutDisplayCard(workoutObject) {
    console.log("entered")
    // debugger
    const workoutCard = document.createElement('div')
    workoutCard.className = 'card'
    workoutCard.dataset.id =  workoutObject.id
    
    const workoutName = document.createElement('h2')
    workoutName.textContent = workoutObject.name
    workoutCard.appendChild(workoutName)

    const blocksArray = workoutObject.blocks // in order to do this, need to have :blocks attr in Workout serializer

    // render each block
    if (blocksArray) {
        blocksArray.forEach(function(block) {
            renderBlock(block, workoutCard)
        })
    }
    // debugger
    workoutDisplay.appendChild(workoutCard)
}

function renderBlock(block, workoutCard) {
    const blockName = document.createElement('h3')

    // in each block, render ExerciseSets
    const exerciseSetsDisplay = document.createElement('ul')

    const exerciseSetsArray = block.exercise_sets // need to have :exercise_sets attr in Block serializer
    debugger
    exerciseSetsArray.forEach(function(exerciseSet) {
        const oneSetDisplay = document.createElement('li')
        oneSetDisplay.textContent = `${exerciseSet.exercise.name}, ${exerciseSet.exercise_rep_num} repetition(s)`
        
        exerciseSetsDisplay.appendChild(oneSetDisplay)
        workoutCard.append(blockName, exerciseSetsDisplay)
    })
}

// render all workout cards
fetchWorkouts().then(function(workoutsArray) {
    workoutsArray.forEach(function(workoutObj) {
        renderWorkoutDisplayCard(workoutObj)
    })
    console.log("working!")
})
