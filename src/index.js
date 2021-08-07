const workoutForm = document.querySelector('form.create-workout-form')
const workoutNameInput = document.querySelector('form.create-workout-form input#workout-name')
const blockExerciseSetForm = document.querySelector('form.create-block-set-form')
const addExerciseSetButton = document.querySelector('button#add-set')
const exerciseSetFormBlock = document.querySelector('div.set-form-block')
const exerciseSetFormContainer = document.querySelector('div.set-form-container')
const blockWorkoutSelectInput = document.querySelector('select.block-exercise-select')
const exerciseSetExerciseSelectInput = document.querySelector('select.set-exercise-select')
const workoutDisplay = document.querySelector('div.workout-display')
const workoutViewContainer = document.querySelector('div.workout-view')

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
async function createExerciseSet(objectsArray, blockId, exerciseSetDisplayList) {
    
    // into body, passing in a hash that contains a hash with a key pointing to an array of hashes
    const response = await fetch('http://127.0.0.1:3000/exercise_sets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify({ exercise_set: { object_array: objectsArray } })
    })
    const data = await response.json()
    return data

    // const data = await response.json()
    // // debugger
    // // .then(data => {
    //     // render ExerciseSet details in Workout displaycard

    //     // debugger
    //     console.log(data.id)
    //     console.log(data.exercise.name)

    //     // create SetRepetition(s)
    //     const setRepData = {
    //         block_id: blockId,
    //         exercise_set_id: data.id,
    //     }
    //     // debugger
    //     for (let i = 0; i < setReps; i++) {
    //         fetch('http://127.0.0.1:3000/set_repetitions', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 "Accept": "application/json"
    //             },
    //             body: JSON.stringify(setRepData)
    //         })
    //         renderSet(data, exerciseSetDisplayList)
    //     }
    // // })
    // // debugger
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

async function createBlock(selectedWorkoutId, blockNameInput) {
    let blockName
    const workoutObj = await fetchWorkoutById(selectedWorkoutId)

    if (blockNameInput.value === "") {
        blockName = `Exercise Block ${workoutObj.blocks.length + 1}`
    } else {
        blockName = blockNameInput.value
    }
    // debugger
    // post request -- create new Block + WorkoutBlock
    const response = await fetch('http://127.0.0.1:3000/blocks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify({ name: blockName })
    })
    const data = await response.json()
    return data
}

// submit handling, create new Block & ExerciseSet(s) form
blockExerciseSetForm.addEventListener('submit', async function(event) {
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

    // =======
    // create ExerciseSet object for each element in array of inputvalue arrays
    const exerciseSetObjectsArray = inputValuesArray.map(function(inputValues) {
        const [ exerciseId, setReps, exerciseRepNum, activeTime, restTime, weight ] = inputValues
        const exerciseSetObject = {
            exercise_id: Number(exerciseId),
            exercise_rep_num: exerciseRepNum,
            active_time: activeTime,
            rest_time: restTime,
            weight: weight,
        }
        return exerciseSetObject
    })
    // debugger
    // =======
    
    // selectedWorkoutInput NEEDS to have id as value
    const [ blockNameInput, selectedWorkoutInput ] = event.target
    const selectedWorkoutId = Number(selectedWorkoutInput.value)

    const newBlock = await createBlock(selectedWorkoutId, blockNameInput)

    // fetchWorkoutById(selectedWorkoutInput.value).then(workoutObj => {
    //     if (blockNameInput.value === "") {
    //         blockName = `Exercise Block ${workoutObj.blocks.length + 1}`
    //     } else {
    //         blockName = blockNameInput.value
    //     }
    //     // debugger
    //     // post request -- create new Block + WorkoutBlock
    //     fetch('http://127.0.0.1:3000/blocks', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             "Accept": "application/json"
    //         },
    //         body: JSON.stringify({ name: blockName })
    //     })
    createWorkoutBlock(newBlock.id, selectedWorkoutId)

    // debugger

    // render Block in the associated Workout display card
    workoutCardInfoContainer = document.querySelector(`div.card[data-id="${selectedWorkoutId}"] div.workout-info-top`)
    renderBlock(newBlock, workoutCardInfoContainer)
    const exerciseSetDisplayList = workoutCardInfoContainer.querySelector(`ol[data-id="${newBlock.id}"]`)

    // create all ExerciseSets in provided ExerciseSet objects array
    const newExerciseSets = await createExerciseSet(exerciseSetObjectsArray)

    // debugger
    // console.log(`exerciseSetDisplayList: ${exerciseSetDisplayList}`)
    // create an ExerciseSet for every inputted ExerciseSet html input block
    // inputValuesArray.forEach(function(inputValues) { // IN ORDER HERE
    //     console.log(`Loop: ${inputValues}`)
    //     createExerciseSet(inputValues, newBlock.id, exerciseSetDisplayList)
    // })

    // extract set repetition numbers from array of ExerciseSet inputs
    const setRepArray = inputValuesArray.map(function(inputValues) {
        const [ exerciseId, setReps, exerciseRepNum, activeTime, restTime, weight ] = inputValues
    
        return Number(setReps)
    })

    const setRepetitionObjectsArray = []
    
    // create SetRepetition objects
    for (let i = 0; i < setRepArray.length; i++) {
        for (let j = 0; j < setRepArray[i]; j++) {
            const oneObject = {
                block_id: newBlock.id,
                exercise_set_id: newExerciseSets[i].id,
            }
            setRepetitionObjectsArray.push(oneObject)

            renderSet(newExerciseSets[i], exerciseSetDisplayList)
        }
    }
    // debugger
    createSetRepetitions(setRepetitionObjectsArray)

    // debugger
    event.target.reset() // form reset
})

async function createSetRepetitions(setRepetitionObjectsArray) {
    fetch('http://127.0.0.1:3000/set_repetitions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify({ set_repetition: { object_array: setRepetitionObjectsArray } })
    })
}

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
    const outerDiv = document.createElement('div')
    outerDiv.dataset.id =  workoutObject.id
    outerDiv.className = 'card'
    
    const workoutCardInfo = document.createElement('div')
    workoutCardInfo.className = 'workout-info-top'
    
    const workoutName = document.createElement('h2')
    workoutName.textContent = workoutObject.name
    workoutName.className = "workout-name"
    workoutCardInfo.appendChild(workoutName)

    const blocksArray = workoutObject.blocks // need to have `has_many :blocks` in Workout serializer
    // debugger
    // render each Block in current Workout
    if (blocksArray) {
        blocksArray.forEach(function(block) {
            renderBlock(block, workoutCardInfo)
        })
    }
    // debugger
    outerDiv.appendChild(workoutCardInfo)
    
    
    // view button
    const buttonDiv = document.createElement('div')
    buttonDiv.className = 'button-flex-end'
    const viewButton = document.createElement('button')
    viewButton.textContent = "View Workout"

    buttonDiv.appendChild(viewButton)
    outerDiv.appendChild(buttonDiv)
    workoutDisplay.appendChild(outerDiv)
}

// render Block details in the associated Workout display card
function renderBlock(block, workoutCard) {
    const blockName = document.createElement('h3')
    blockName.textContent = block.name

    // in each block, render container to store ExerciseSets
    const exerciseSetsDisplay = document.createElement('ol')
    exerciseSetsDisplay.dataset.id = block.id

    const exerciseSetsArray = block.exercise_sets // need to have `has_many :exercise_sets` in Block serializer
    // exerciseSetsArray.sort(function(a, b) { 
    //     return a.id - b.id
    //   })
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
    // console.log("working!")
})

// clicking on "View Workout" button on a Workout display card shows the specific Workout info card below
workoutDisplay.addEventListener('click', function(event) {
    if (event.target.matches('button')) {
        // display the specific Workout view card
        workoutViewContainer.style.display = 'block'

        // get specific Workout card
        const selectedCard = event.target.closest('div').parentElement

        // get Workout object
        fetchWorkoutById(selectedCard.dataset.id).then(workoutObject => {
            // display Workout name
            const viewWorkoutName = workoutViewContainer.querySelector('div.view-card h2#specific-workout-name')
            viewWorkoutName.textContent = workoutObject.name
        })
        
    }
})

// clicking "X" button on specific Workout info card closes the display
const closeDisplayButtom = workoutViewContainer.querySelector('button#close-display')

closeDisplayButtom.addEventListener('click', function() {
    workoutViewContainer.style.display = 'none'
})
