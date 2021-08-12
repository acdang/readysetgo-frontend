const workoutForm = document.querySelector('form.create-workout-form')
const workoutNameInput = document.querySelector('form.create-workout-form input#workout-name')
const blockExerciseSetForm = document.querySelector('form.create-block-set-form')
const addExerciseSetButton = document.querySelector('button#add-set')
const exerciseSetFormBlock = document.querySelector('div.set-form-block')
const exerciseSetFormContainer = document.querySelector('div.set-form-container')
const blockWorkoutSelectInput = document.querySelector('select.block-exercise-select')
const exerciseSetExerciseSelectInput = document.querySelector('div.set-form-container select.set-exercise-select')
const updateExerciseSelectInput = document.querySelector('form.update-set-form-block select')
const workoutDisplay = document.querySelector('div.workout-display')
const workoutViewContainer = document.querySelector('div.workout-view')
const viewCard = workoutViewContainer.querySelector('div.view-card')
const blockSetContainer = viewCard.querySelector('div#block-set-container')
const selectExistingBlockForm = document.querySelector('form.add-existing-block-form')
const workoutSelectExistingBlock = document.querySelector('form.add-existing-block-form select.select-workout')
const divToSelectWorkoutToAddTo = selectExistingBlockForm.querySelector('div.select-workout-to-add-to')
const updateForm = viewCard.querySelector('div.edit-set-form')

async function fetchWorkouts() {
    const resp = await fetch('http://127.0.0.1:3000/workouts')
    return resp.json()
}

async function fetchWorkoutById(id) {
    // const workoutsArray = await fetchWorkouts()
    // return workoutsArray.find(workoutObj => workoutObj.id == id)

    const resp = await fetch(`http://127.0.0.1:3000/workouts/${id}`)
    return resp.json()
}

async function fetchExercises() {
    const resp = await fetch('http://127.0.0.1:3000/exercises')
    return resp.json()
}

async function fetchExerciseById(id) {
    const resp = await fetch(`http://127.0.0.1:3000/exercises/${id}`)
    return resp.json()
}

async function fetchExerciseSetById(id) {
    const resp = await fetch(`http://127.0.0.1:3000/exercise_sets/${id}`)
    return resp.json()
}

async function fetchBlockById(id) {
    const resp = await fetch(`http://127.0.0.1:3000/blocks/${id}`)
    return resp.json()
}

// on load render placeholder/default for Workout name input field
fetchWorkouts().then(function(workoutsArray) {
    workoutNameInput.placeholder = `Workout ${workoutsArray.length + 1}`
})

// on form submit, assigns default placeholder as name value for new Workout (if no user-provided name)
function autoWorkoutNameValue(input) {
    input.value = input.placeholder
}

function exerciseSetDetailsLine(hasRepetitions, exerciseName, exerciseRepetitionsOrActiveTime) {
    let singleOrPlural
    if (hasRepetitions) {
        singleOrPlural = exerciseRepetitionsOrActiveTime > 1 ? "repetitions" : "repetition"
    } else {
        singleOrPlural = exerciseRepetitionsOrActiveTime > 1 ? "seconds" : "second"
    }

    return `${exerciseName}, ${exerciseRepetitionsOrActiveTime} ${singleOrPlural}`
}

// submit handling on create new Workout form
workoutForm.addEventListener('submit', async function(event) {
    event.preventDefault()

    const workoutName = event.target[0]

    // assign default placeholder as new Workout name if no user-provided name
    if (workoutName.value == "") {
        autoWorkoutNameValue(workoutName)
    }
    
    // update workout name input placeholder
    const origPlaceholderNum = Number(workoutName.placeholder.match(/\d+/)[0])
    workoutName.placeholder = `Workout ${origPlaceholderNum + 1}`

    const response = await fetch('http://127.0.0.1:3000/workouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify({
            name: workoutName.value
        })
    })
    const workoutData = await response.json()
    createWorkoutOption(workoutData) // for select input in the create Block+ExerciseSet form
    renderWorkoutDisplayCard(workoutData)

    event.target.reset() // form reset
})

const selectBlockInput = document.querySelector('form.add-existing-block-form select.select-block')
workoutSelectExistingBlock.addEventListener('change', async function(event) {
    // get all blocks of workout selected
    const selectedWorkout = await fetchWorkoutById(Number(event.target.value))
    const allBlocks = selectedWorkout.blocks
    // debugger
    selectBlockInput.dataset.id = Number(event.target.value)
    selectBlockInput.style.display = ''
   
    while (selectBlockInput.querySelectorAll('option').length != 1) {
        selectBlockInput.lastChild.remove()
    }

    allBlocks.forEach(block => {
        const newOption = document.createElement('option')
        newOption.value = block.id
        newOption.textContent = block.name
        selectBlockInput.appendChild(newOption)
    })
})
const miniDisplay = selectExistingBlockForm.querySelector('div.mini-display')
const submitButton = selectExistingBlockForm.querySelector('input.submit-button')
selectBlockInput.addEventListener('change', function(event) {
    // find a block display of chosen block
    const workoutId = Number(event.target.dataset.id)
    const chosenBlock = Number(event.target.value)
    const existingBlockDisplay = workoutDisplay.querySelector(`div.card[data-id="${workoutId}"] div.one-block[data-id="${chosenBlock}"]`)
    const copyToDisplay = existingBlockDisplay.cloneNode(true)

    // const miniDisplay = selectExistingBlockForm.querySelector('div.mini-display')
    if (miniDisplay.firstChild) { miniDisplay.firstChild.remove() }
    miniDisplay.appendChild(copyToDisplay)

    divToSelectWorkoutToAddTo.style.display = ''
    // const submitButton = selectExistingBlockForm.querySelector('input.submit-button')
    submitButton.style.display = ''
})

selectExistingBlockForm.addEventListener('submit', function(event) {
    event.preventDefault()

    const blockInMiniDisplay = miniDisplay.querySelector('div')
    const destinationWorkoutId = event.target.destination.value
    // debugger
    // add to workout display card
    const workoutDisplayCard = workoutDisplay.querySelector(`div.card[data-id="${destinationWorkoutId}"] div.workout-info-top`)
    workoutDisplayCard.appendChild(blockInMiniDisplay)

    // add to view card if open
    if (workoutViewContainer.style.display !== 'none' && workoutViewContainer.dataset.id == destinationWorkoutId) {
        const copy = blockInMiniDisplay.cloneNode(true)
        const container = viewCard.querySelector('div#block-set-container')
        container.appendChild(copy)
    }

    fetch('http://127.0.0.1:3000/workout_blocks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        },
        body: JSON.stringify({ 
            block_id: Number(event.target.block_id.value), 
            workout_id: Number(destinationWorkoutId)
        })
    })

    selectBlockInput.style.display = 'none'
    divToSelectWorkoutToAddTo.style.display = 'none'
    submitButton.style.display = 'none'

    event.target.reset()
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

    // reset fields
    const allInputs = newSetFormBlock.querySelectorAll('input')
    allInputs.forEach(inputField => inputField.value = '')
    
    const lineBreak = document.createElement('hr')
    
    exerciseSetFormContainer.append(lineBreak, newSetFormBlock)
})

// add option tag to select Workout input in Block/ExerciseSet form
function createWorkoutOption(workoutObject) {
    // create option
    const newOption = document.createElement('option')
    // assign name & id to option
    newOption.value = workoutObject.id
    // debugger
    newOption.textContent = workoutObject.name
    // append to create block form select input
    blockWorkoutSelectInput.appendChild(newOption)
    // append to select existing block form select input (workout to GET block from)
    const copy = newOption.cloneNode(true)
    workoutSelectExistingBlock.appendChild(copy)
    // append to select existing block form select input (workout to ADD block to)
    const copy2 = newOption.cloneNode(true)
    const selectInput = divToSelectWorkoutToAddTo.querySelector('select')
    selectInput.appendChild(copy2)
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

// submit handling on create new Block & ExerciseSet(s) form
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

    createWorkoutBlock(newBlock.id, selectedWorkoutId)

    // debugger

    // render Block in the associated Workout display card
    const workoutCardInfoContainer = document.querySelector(`div.card[data-id="${selectedWorkoutId}"] div.workout-info-top`)
    renderBlock(newBlock, workoutCardInfoContainer)
    // CAN PROB SIMPLIFY THIS (BELOW) BY USING QUERYSELECTORALL?????
    if (workoutViewContainer.style.display !== 'none' && workoutViewContainer.dataset.id == selectedWorkoutId) {
        renderBlock(newBlock, blockSetContainer)
    }
    const exerciseSetDisplayList = workoutCardInfoContainer.querySelector(`div.exercise-set-display[data-id="${newBlock.id}"]`)
    const exerciseSetDisplayListViewCard = workoutViewContainer.querySelector(`div.exercise-set-display[data-id="${newBlock.id}"]`)
    // create all ExerciseSets in provided ExerciseSet objects array
    const newExerciseSets = await createExerciseSet(exerciseSetObjectsArray)

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
            if (workoutViewContainer.style.display !== 'none' && workoutViewContainer.dataset.id == selectedWorkoutId) {
                // add Edit and Delete buttons
                let isFirstRepetition = false
                if (j === 0) { // buttons to only first displayblock of repeating sets
                    isFirstRepetition = true
                }

                renderSet(newExerciseSets[i], exerciseSetDisplayListViewCard, isFirstRepetition)
            }
        }
    }

    // debugger
    createSetRepetitions(setRepetitionObjectsArray)
    // toggleEditingMode("off")
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
    const forUpdateForm = newOption.cloneNode(true)
    updateExerciseSelectInput.appendChild(forUpdateForm)
    // debugger
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
function renderBlock(block, selectedDiv) {
    const blockDiv = document.createElement('div')
    blockDiv.className = 'one-block'
    blockDiv.dataset.id = block.id

    const blockNameContainer = document.createElement('div')
    blockNameContainer.className = 'block-name-container'
    const blockNameSpan = document.createElement('span')
    blockNameSpan.className = 'block-name-span'
    const blockName = document.createElement('h3')
    blockName.textContent = block.name
    blockNameSpan.appendChild(blockName)
    blockNameContainer.appendChild(blockNameSpan)

    // in each block, render container to store ExerciseSets
    const exerciseSetsDisplay = document.createElement('div')
    exerciseSetsDisplay.className = 'exercise-set-display'
    exerciseSetsDisplay.dataset.id = block.id

    const exerciseSetsArray = block.exercise_sets // need to have `has_many :exercise_sets` in Block serializer

    // render delete Block button in view card
    if (selectedDiv === blockSetContainer) {
        const deleteButtonSpan = document.createElement('span')
        const deleteBlockButton = document.createElement('button')
        deleteBlockButton.className = 'delete-block-button'
        deleteBlockButton.style.display = 'none'
        deleteBlockButton.textContent = 'Delete Block'
        deleteButtonSpan.appendChild(deleteBlockButton)

        blockNameContainer.appendChild(deleteButtonSpan)
    }

    // for each ExceriseSet in current Block, render its details within Block display of Workout display card
    if (exerciseSetsArray.length !== 0) {
        exerciseSetsArray.forEach(function(exerciseSet, index, array) { // need to have `has_one :exercise` in ExerciseSet serializer
            // debugger
            // renderSet(exerciseSet, exerciseSetsDisplay)

            let isFirstRepetition = false
            if (selectedDiv === blockSetContainer) {
                // if (index !== (exerciseSetsArray.length - 1)) {
                    // console.log(index)
                    if (index === 0 || exerciseSet.id !== exerciseSetsArray[index - 1].id) { // buttons to only first displayblock of repeating sets
                        // console.log(exerciseSet.id)
                        isFirstRepetition = true
                    }             
                // }
            }
            renderSet(exerciseSet, exerciseSetsDisplay, isFirstRepetition)
            // renderSet(newExerciseSets[i], exerciseSetDisplayListViewCard, isFirstRepetition)
        })
    }
    blockDiv.append(blockNameContainer, exerciseSetsDisplay)
    selectedDiv.append(blockDiv)
}

// render display details of an ExerciseSet
function renderSet(exerciseSet, exerciseSetsDisplay, isFirstDisplay) {
    const oneSetDisplay = document.createElement('div')
    oneSetDisplay.className = 'one-set'
    oneSetDisplay.dataset.id = exerciseSet.id

    const infoSpan = document.createElement('span')
    infoSpan.className = 'set-info'

    if (exerciseSet.exercise_rep_num) {
        infoSpan.textContent = exerciseSetDetailsLine(true, exerciseSet.exercise.name, exerciseSet.exercise_rep_num)
    } else {
        infoSpan.textContent = exerciseSetDetailsLine(false, exerciseSet.exercise.name, exerciseSet.active_time)
    }
    oneSetDisplay.appendChild(infoSpan)

    if (arguments[2] && isFirstDisplay === true) {
        const buttonSpan = document.createElement('span')
        buttonSpan.className = 'editing-mode-buttons'
        buttonSpan.style.display = 'none'

        const editButton = document.createElement('button')
        editButton.textContent = 'Edit'
        editButton.className = 'edit-set-button'

        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'Delete'
        deleteButton.className = 'delete-set-button'

        buttonSpan.append(editButton, deleteButton)
        oneSetDisplay.appendChild(buttonSpan)
    }

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
workoutDisplay.addEventListener('click', async function(event) {
    if (event.target.matches('button')) { // likely need to specify what this button is with class name
        toggleEditingMode("off")
        toggleWorkoutMode("off")
        // clear contents
        while (blockSetContainer.firstChild) {
            blockSetContainer.removeChild(blockSetContainer.lastChild);
        }

        // display the specific Workout view card
        workoutViewContainer.style.display = 'block'

        // get specific Workout card
        const selectedCard = event.target.closest('div').parentElement
        workoutViewContainer.dataset.id = selectedCard.dataset.id
        // get Workout object
        const workoutObject = await fetchWorkoutById(selectedCard.dataset.id)
        // display Workout name
        const viewWorkoutName = viewCard.querySelector('h2#specific-workout-name')
        viewWorkoutName.textContent = workoutObject.name
        
        // const editButton = viewCard.querySelector('button#editing-mode-button')
        // editButton.className = 'mode-off'
        // display Blocks and ExerciseSets on left side
        const blocksArray = workoutObject.blocks // need to have `has_many :blocks` in Workout serializer
        // debugger
        // render each Block in current Workout
        if (blocksArray.length !== 0) {
            blocksArray.forEach(function(block) {
                renderBlock(block, blockSetContainer)
                // show Edit button
                // editButton.style.display = ''
            })
        } else {
            // hide Edit button
            // editButton.style.display = 'none'
        }
        toggleEditingMode("off")
    }
})

// clicking "X" button on specific Workout info card closes the display
const closeDisplayButtom = workoutViewContainer.querySelector('button#close-display')
closeDisplayButtom.addEventListener('click', function() {
    workoutViewContainer.style.display = 'none'
})

let editingMode = false
// event handling in Workout view card
viewCard.addEventListener('click', async function(event) {
    // event.stopPropagation()
    // editing mode button
    if (event.target.matches('button#editing-mode-button')) {
        const editModeButton = event.target
        // to turn on editing mode
        if (editModeButton.className === 'mode-off') {
            toggleEditingMode("on")
            // editModeButton.className = 'mode-on'
            // editModeButton.textContent = 'Exit Editing Mode'
        } else if (editModeButton.className === 'mode-on') {
            toggleEditingMode("off")
            // editModeButton.className = 'mode-off'
            // editModeButton.textContent = 'Enter Editing Mode'
        }
    } else if (event.target.matches('button#begin-workout-button')) {
        const workoutModeButton = event.target

        const editingModeButton = viewCard.querySelector('button#editing-mode-button')
        if (editingModeButton.className === "mode-on") { toggleEditingMode("off") }

        if (workoutModeButton.className === 'mode-off') {
            toggleWorkoutMode("on")
            // workoutModeButton.className = 'mode-on'
            // workoutModeButton.textContent = 'Exit Workout'
        } else if (workoutModeButton.className === 'mode-on') {
            toggleWorkoutMode("off")
            // workoutModeButton.className = 'mode-off'
            // workoutModeButton.textContent = 'Begin Workout'
        }
    } else if (event.target.matches('div#next-set-button button')) {
        handleNextSet()
    } else if (event.target.matches('button.delete-block-button')) {
        const deleteBlockButton = event.target
        // get the specific Block+Set display div
        const blockSetDisplayInView = deleteBlockButton.closest('div.one-block')
        // get selected Block id
        const selectedBlockId = Number(blockSetDisplayInView.dataset.id)

        // get id of Workout this Block belongs to
        const workoutId = blockSetDisplayInView.closest('div.workout-view').dataset.id

        // get position of this Block
        const allBlocksInView = Array.from(viewCard.querySelectorAll('div.one-block'))
        const indexOfSelectedBlock = allBlocksInView.indexOf(blockSetDisplayInView)

        // get index of this Block out of all of it duplicate Blocks in this Workout
        const allSameBlocksInView = Array.from(viewCard.querySelectorAll(`div.one-block[data-id="${selectedBlockId}"]`))
        const indexOfBlockToBeRemoved = allSameBlocksInView.indexOf(blockSetDisplayInView)

        // remove all display of this Block from view
        blockSetDisplayInView.remove()
        // remove all display of this Block from its Workout display card
        const workoutCard = workoutDisplay.querySelector(`div.card[data-id="${workoutId}"]`)
        const allBlocksInWorkoutDisplay = workoutCard.querySelectorAll(`div.one-block`)
        allBlocksInWorkoutDisplay[indexOfSelectedBlock].remove()

        // const allDisplays = document.querySelectorAll(`div.one-block[data-id="${selectedBlockId}"]`)
        // allDisplays.forEach(display => display.remove())

        // hide update form if open
        if (updateForm.display !== 'none') { updateForm.display = 'none' }

        // // remove selected Block+Set display from view card
        // blockSetDisplayInView.remove()
        // // remove selected Block+Set display from display card
        // const blockSetDisplayInDisplay = workoutDisplay.querySelector(`div.one-block[data-id="${selectedBlockId}"]`)
        // blockSetDisplayInDisplay.remove()

        // removing this WorkoutBlock instance from Workout
        fetch('http://127.0.0.1:3000/workout_blocks/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
            body: JSON.stringify({
                block_id: selectedBlockId, 
                workout_id: workoutId,
                index_to_remove: indexOfBlockToBeRemoved
            })
        })

        // delete fetch request
        // const response = await fetch(`http://127.0.0.1:3000/blocks/${selectedBlockId}`, {
        //     method: 'DELETE'
        // })
    } else if (event.target.matches('button.delete-set-button')) {
        // WARNING: deleting a Set will affect all duplicated Blocks of the Block this Set belongs to

        const deleteSetButton = event.target
        // get selected ExerciseSet id
        const exerciseSetDisplayDiv = deleteSetButton.closest('div.one-set')
        const selectedExerciseSetId = Number(exerciseSetDisplayDiv.dataset.id)
        // remove all displays of this ExerciseSet from view card
        const allDisplays = document.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
        allDisplays.forEach(display => display.remove())

        const response = await fetch(`http://127.0.0.1:3000/exercise_sets/${selectedExerciseSetId}`, {
            method: 'DELETE'
        })
    } else if (event.target.matches('button#delete-workout-button')) {
        const deleteWorkoutButton = event.target
        // get the selected Workout id
        const selectedWorkoutId = deleteWorkoutButton.closest('div.workout-view').dataset.id
        // hide view
        workoutViewContainer.style.display = 'none'
        toggleEditingMode("off")
        // remove the display card of this Workout
        const selectedWorkoutDisplayCard = workoutDisplay.querySelector(`div.card[data-id="${selectedWorkoutId}"]`)
        selectedWorkoutDisplayCard.remove()

        const response = await fetch(`http://127.0.0.1:3000/workouts/${selectedWorkoutId}`, {
            method: 'DELETE'
        })
    } else if (event.target.matches('button.edit-set-button')) {
        handleEditButtons(true)
        const editSetButton = event.target

        const selectedDiv = editSetButton.closest('div.one-set')
        // get the selected ExerciseSet id
        const selectedExerciseSetId = Number(selectedDiv.dataset.id)
        // get the selected Set
        const selectedSet = await fetchExerciseSetById(selectedExerciseSetId)

        // highlight selected divs
        // to account for more than one instance of the same Block in a Workout
        const allSameDivs = viewCard.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
        allSameDivs.forEach(div => div.classList.add('currently-editing'))
        // selectedDiv.classList.add('currently-editing')

        // show update form
        const updateForm = viewCard.querySelector('div.edit-set-form')
        updateForm.style.display = 'block'
        updateForm.dataset.id = selectedExerciseSetId
        // console.log(selectedExerciseSetId)

        // pre-fill fields with current values
        const exerciseSelect = updateForm.querySelector('select')
        const inputFieldElementsArray = updateForm.querySelectorAll('input')
        const [ setReps, exerciseReps, activeTime, restTime, weight ] = inputFieldElementsArray

        const currentBlockId = Number(editSetButton.closest('div.one-block').dataset.id)
        const currentBlockObj = await fetchBlockById(currentBlockId)
        const origSetReps = currentBlockObj.exercise_sets.filter(set => set.id === selectedExerciseSetId).length
        // debugger
        exerciseSelect.value = selectedSet.exercise.id
        setReps.placeholder = origSetReps
        exerciseReps.placeholder = selectedSet.exercise_rep_num ? selectedSet.exercise_rep_num : ""
        activeTime.placeholder = selectedSet.active_time ? selectedSet.active_time : ""
        restTime.placeholder = selectedSet.rest_time ? selectedSet.rest_time : ""
        weight.placeholder = selectedSet.weight ? selectedSet.weight : ""

        updateForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const form = event.target
            // get new inputs
            const updatedExerciseSelect = form.querySelector('select')
            const updatedFieldElementsArray = form.querySelectorAll('input')
            const allElements = [updatedExerciseSelect, ...updatedFieldElementsArray]
            const [ exerciseId, setReps, exerciseReps, activeTime, restTime, weight ] = allElements

            // updated attributes hash
            const updatedDataHash = { }
            allElements.forEach((inputHtml, index) => {
                if (inputHtml.value !== "") {
                    // console.log(allElements[0][0])
                    const inputValue = Number(inputHtml.value)
                    switch (index) {
                        case 0:
                            if (updatedExerciseSelect.value != selectedSet.exercise.id) {
                                updatedDataHash.exercise_id = inputValue
                            }
                            break
                        case 2:
                            updatedDataHash.exercise_rep_num = inputValue
                            break
                        case 3:
                            updatedDataHash.active_time = inputValue
                            break
                        case 4:
                            updatedDataHash.rest_time = inputValue
                            break
                        case 5:
                            updatedDataHash.weight = inputValue
                            break
                    }
                }
            })
            // if new ExerciseSet rep input
            if (setReps.value !== "") {
                const updatedSetRepetitions = Number(setReps.value)
                // console.log(updatedSetRepetitions)
                // debugger

                // account for more than one instance of the same Block in a Workout
                const allSameBlocksInView = viewCard.querySelectorAll(`div.one-block[data-id="${currentBlockId}"]`)
                const allSameBlocksInDisplay = workoutDisplay.querySelectorAll(`div.one-block[data-id="${currentBlockId}"]`)
                // remove excess displays
                if (updatedSetRepetitions < origSetReps) {
                    // from view card
                    allSameBlocksInView.forEach(block => {
                        let viewCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                        while (viewCardSets.length != updatedSetRepetitions) {
                            const lastIndex = viewCardSets.length - 1
                            viewCardSets[lastIndex].remove()
                            viewCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                        }
                    })
                    // from display card
                    allSameBlocksInDisplay.forEach(block => {
                        let displayCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                        while (displayCardSets.length != updatedSetRepetitions) {
                            const lastIndex = displayCardSets.length - 1
                            displayCardSets[lastIndex].remove()
                            displayCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                        }
                    })
                    // delete SetRepetitions
                    const numOfRepsToDelete = origSetReps - updatedSetRepetitions
                    // num_to_delete
                    fetch('http://127.0.0.1:3000/set_repetitions/reduce', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            set_repetition: {
                                num_change: numOfRepsToDelete,
                                block_id: currentBlockObj.id,
                                exercise_set_id: selectedExerciseSetId,
                            }
                        })
                    })

                    updateForm.style.display = 'none'

                    // remove highlighting
                    const allSetDivs = Array.from(viewCard.querySelectorAll('.currently-editing'))
                    allSetDivs.forEach(div => div.classList.remove('currently-editing'))
                    handleEditButtons(false)
                }
                // create new displays
                if (updatedSetRepetitions > origSetReps) {
                    // to view card
                    allSameBlocksInView.forEach(block => {
                        let viewCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                        while (viewCardSets.length !== updatedSetRepetitions) {
                            const lastIndex = viewCardSets.length - 1
                            const newSetDisplay = viewCardSets[lastIndex].cloneNode(true)
                            // newSetDisplay.classList.remove('currently-editing')
                            if (viewCardSets.length === 1) {
                                const buttons = newSetDisplay.querySelector('span.editing-mode-buttons')
                                buttons.remove()
                            }
                            // viewCardSets[lastIndex].parentElement.appendChild(newSetDisplay)
                            const parent = viewCardSets[lastIndex].parentElement
                            parent.insertBefore(newSetDisplay, viewCardSets[lastIndex].nextElementSibling)
                            viewCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                            // console.log('wha')
                            // setReps.placeholder = newSetReps
                            // handleEditButtons(false)
                        }
                    })
                    // to display card
                    allSameBlocksInDisplay.forEach(block => {
                        let displayCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                        while (displayCardSets.length != updatedSetRepetitions) {
                            const lastIndex = displayCardSets.length - 1
                            const newSetDisplay = displayCardSets[lastIndex].cloneNode(true)
                            // displayCardSets[lastIndex].parentElement.appendChild(newSetDisplay)
                            const parent = displayCardSets[lastIndex].parentElement
                            parent.insertBefore(newSetDisplay, displayCardSets[lastIndex].nextElementSibling)
                            // displayCardSets[lastIndex].nextElementSibling.insertBefore(newSetDisplay)
                            displayCardSets = block.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                        }
                    })

                    const numOfRepsToAdd = updatedSetRepetitions - origSetReps
                    // create new SetRepetitions
                    fetch('http://127.0.0.1:3000/set_repetitions/increase', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            set_repetition: {
                                num_change: numOfRepsToAdd,
                                block_id: currentBlockObj.id,
                                exercise_set_id: selectedExerciseSetId,
                            }
                        })
                    })
                    updateForm.style.display = 'none'

                    // remove highlighting
                    const allSetDivs = Array.from(viewCard.querySelectorAll('.currently-editing'))
                    allSetDivs.forEach(div => div.classList.remove('currently-editing'))
                    handleEditButtons(false)
                }
            }
            // update text if new
            if (updatedDataHash.exercise_id || updatedDataHash.exercise_rep_num || updatedDataHash.active_time) {
                const allInDisplayCards = workoutDisplay.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
                const allInViewCard = viewCard.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"] span.set-info`)
                const exerciseObj = await fetchExerciseById(updatedDataHash.exercise_id)
                // if both exercise and num of exercise reps changed
                if (updatedDataHash.exercise_id && updatedDataHash.exercise_rep_num) {
                    allInDisplayCards.forEach(element => element.textContent = exerciseSetDetailsLine(true, exerciseObj.name, updatedDataHash.exercise_rep_num))
                    allInViewCard.forEach(element => element.textContent = exerciseSetDetailsLine(true, exerciseObj.name, updatedDataHash.exercise_rep_num))
                // if both exercise and active time changed
                } else if (updatedDataHash.exercise_id && updatedDataHash.active_time) {
                    allInDisplayCards.forEach(element => element.textContent = exerciseSetDetailsLine(false, exerciseObj.name, updatedDataHash.active_time))
                    allInViewCard.forEach(element => element.textContent = exerciseSetDetailsLine(false, exerciseObj.name, updatedDataHash.active_time))
                }
                // if only exercise changed
                else if (updatedDataHash.exercise_id) {
                    if (selectedSet.exercise_rep_num) {
                        allInDisplayCards.forEach(element => element.textContent = exerciseSetDetailsLine(true, exerciseObj.name, selectedSet.exercise_rep_num))
                        allInViewCard.forEach(element => element.textContent = exerciseSetDetailsLine(true, exerciseObj.name, selectedSet.exercise_rep_num))    
                    } else {
                        allInDisplayCards.forEach(element => element.textContent = exerciseSetDetailsLine(false, exerciseObj.name, selectedSet.active_time))
                        allInViewCard.forEach(element => element.textContent = exerciseSetDetailsLine(false, exerciseObj.name, selectedSet.active_time))    
                    }
                // if only num of exercise reps changed
                } else if (updatedDataHash.exercise_rep_num) {
                    allInDisplayCards.forEach(element => element.textContent = exerciseSetDetailsLine(true, selectedSet.exercise.name, updatedDataHash.exercise_rep_num))
                    allInViewCard.forEach(element => element.textContent = exerciseSetDetailsLine(true, selectedSet.exercise.name, updatedDataHash.exercise_rep_num))
                // if only active time changed
                } else if (updatedDataHash.active_time) {
                    allInDisplayCards.forEach(element => element.textContent = exerciseSetDetailsLine(false, selectedSet.exercise.name, updatedDataHash.active_time))
                    allInViewCard.forEach(element => element.textContent = exerciseSetDetailsLine(false, selectedSet.exercise.name, updatedDataHash.active_time))
                }
            }

            // update
            if (Object.keys(updatedDataHash).length !== 0) {
                const response = await fetch(`http://127.0.0.1:3000/exercise_sets/${selectedExerciseSetId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ exercise_set: updatedDataHash })
                })
                const updatedExerciseSet = await response.json()
                // console.log(updatedDataHash)
                // just change text content + number of applicable ExerciseSet displays
                // form.reset()
                // exerciseSelect.value = updatedExerciseSet.exercise.id
                
                // const currentBlockObj = await fetchBlockById(currentBlockId)
                // const newSetReps = currentBlockObj.exercise_sets.filter(set => set.id === selectedExerciseSetId).length
                // setReps.placeholder = newSetReps

                // exerciseReps.placeholder = updatedExerciseSet.exercise_rep_num ? updatedExerciseSet.exercise_rep_num : ""
                // activeTime.placeholder = updatedExerciseSet.active_time ? updatedExerciseSet.active_time : ""
                // restTime.placeholder = updatedExerciseSet.rest_time ? updatedExerciseSet.rest_time : ""
                // weight.placeholder = updatedExerciseSet.weight ? updatedExerciseSet.weight : ""

                updateForm.style.display = 'none'

                // remove highlighting
                allSameDivs.forEach(div => div.classList.remove('currently-editing'))

                handleEditButtons(false)
            }
        })
    } else if (event.target.matches('button.cancel-edit-button')) {
        // console.log('clicked')

        // unhighlight any highlighted divs
        const allSets = Array.from(viewCard.querySelectorAll('div.one-set'))
        allSets.forEach(setDiv => setDiv.classList.remove('currently-editing'))

        // hide form
        updateForm.style.display = 'none'
        // enable edit buttons again
        handleEditButtons(false)
    }
})

function toggleEditingMode(mode) {
    const editModeButton = viewCard.querySelector('button#editing-mode-button')
    const allEditingButtonSpans = viewCard.querySelectorAll('span.editing-mode-buttons')
    const allDeleteBlockButtons = viewCard.querySelectorAll('button.delete-block-button')
    const deleteWorkoutButton = viewCard.querySelector('button#delete-workout-button')
    if (mode === "on") {
        allEditingButtonSpans.forEach(span => span.style.display = '')
        allDeleteBlockButtons.forEach(button => button.style.display = '')
        editModeButton.className = 'mode-on'
        editModeButton.textContent = 'Exit Editing Mode'
        deleteWorkoutButton.style.display = 'block'
    } else if (mode === "off") {
        allEditingButtonSpans.forEach(span => span.style.display = 'none')
        allDeleteBlockButtons.forEach(button => button.style.display = 'none')
        deleteWorkoutButton.style.display = 'none'
        editModeButton.className = 'mode-off'
        editModeButton.textContent = 'Enter Editing Mode'

        // unhighlight any highlighted divs
        const allSets = Array.from(viewCard.querySelectorAll('div.one-set'))
        allSets.forEach(setDiv => setDiv.classList.remove('currently-editing'))

        // hide update form
        updateForm.style.display = 'none'
    }
}

const exerciseDisplayDiv = viewCard.querySelector('div.exercise-display')
async function toggleWorkoutMode(mode) {
    const workoutModeButton = viewCard.querySelector('button#begin-workout-button')

    // unhighlight any highlighted divs
    const allSets = viewCard.querySelectorAll('div.one-set')
    const lastViewedSet = Array.from(allSets).find(setDiv => setDiv.classList.contains('currently-viewing'))
    if (lastViewedSet) { lastViewedSet.classList.remove('currently-viewing') }

    // debugger
    if (mode === "on") {
        workoutModeButton.className = 'mode-on'
        workoutModeButton.textContent = 'Exit Workout'
        // get first Set id
        const firstId = allSets[0].dataset.id
        // allSets[0].classList.add('currently-viewing')
        // fetch Set
        const firstSet = await fetchExerciseSetById(firstId)

        // const lastViewedSet = Array.from(allSets).find(setDiv => setDiv.classList.contains('currently-viewing'))
        // if (lastViewedSet) { lastViewedSet.classList.remove('currently-viewing') }

        exerciseDisplayDiv.style.display = 'block'
        // show first set repetition
        displayExerciseInfo(firstSet, allSets[0])
        const nextButton = exerciseDisplayDiv.querySelector('div#next-set-button button')
        nextButton.disabled = false
    } else if (mode === "off") {
        exerciseDisplayDiv.style.display = 'none'
        workoutModeButton.className = 'mode-off'
        workoutModeButton.textContent = 'Begin Workout'
    }
}

const restTimer = new easytimer.Timer()
const activeTimer = new easytimer.Timer()

restTimer.addEventListener('secondsUpdated', function(event) {
    document.querySelector('#rest-timer').textContent = restTimer.getTimeValues().toString()
})
restTimer.addEventListener('started', function (e) {
    document.querySelector('#rest-timer').textContent = restTimer.getTimeValues().toString()
});
restTimer.addEventListener('reset', function (e) {
    document.querySelector('#rest-timer').textContent = restTimer.getTimeValues().toString()
});

activeTimer.addEventListener('secondsUpdated', function(event) {
    document.querySelector('#active-timer').textContent = activeTimer.getTimeValues().toString()
})
activeTimer.addEventListener('started', function (e) {
    document.querySelector('#active-timer').textContent = activeTimer.getTimeValues().toString()
});
activeTimer.addEventListener('reset', function (e) {
    document.querySelector('#active-timer').textContent = activeTimer.getTimeValues().toString()
});

function displayExerciseInfo(firstSet, htmlElement) {
    // highlight the div
    htmlElement.classList.add('currently-viewing')
    // block name
    const blockDiv = htmlElement.closest('div.one-block')
    const blockNameInDiv = blockDiv.firstChild.firstChild.textContent
    const blockName = exerciseDisplayDiv.querySelector('h3#exercise-display-block-name')
    blockName.textContent = blockNameInDiv

    // exercise name
    const exerciseName = exerciseDisplayDiv.querySelector('h1#exercise-display-exercise-name')
    exerciseName.textContent = firstSet.exercise.name

    // exercise repetition/active time display
    const exerciseReps = exerciseDisplayDiv.querySelector('h2#exercise-display-reps')
    const activeTime = exerciseDisplayDiv.querySelector('h2#exercise-display-active-time')
    if (firstSet.exercise_rep_num) {
        exerciseReps.textContent = firstSet.exercise_rep_num > 1 ? `${firstSet.exercise_rep_num} reps` : `${firstSet.exercise_rep_num} rep`
    } else {
        exerciseReps.style.display = 'none'
    }
    if (firstSet.active_time) {
        activeTime.textContent = firstSet.active_time > 1 ? `${firstSet.active_time} seconds` : `${firstSet.active_time} second`

        const activeTimerDiv = exerciseDisplayDiv.querySelector('div#active-timer-div')
        activeTimerDiv.style.display = ''
        const activeTimerDisplay = activeTimerDiv.querySelector('div#active-timer')
        const display = new Date(firstSet.active_time * 1000).toISOString().substr(11, 8)
        activeTimerDisplay.textContent = display

        const activeTimerButton = activeTimerDiv.querySelector('button#start-active-timer-button')
        activeTimerButton.addEventListener('click', function(event) {
            const button = event.target
            if (button.className === 'start-timer') {
                activeTimer.start({countdown: true, startValues: {seconds: firstSet.active_time}});
                activeTimerDisplay.textContent = activeTimer.getTimeValues().toString()

                // button.textContent = "Pause"
                // button.className = 'pause-timer'
            }
        })
        const resetButton = activeTimerDiv.querySelector('button#reset-active-timer-button')
        resetButton.addEventListener('click', function(event) {
            activeTimer.reset()
            activeTimer.stop()
        })
        const pauseButton = activeTimerDiv.querySelector('button#pause-active-timer-button')
        pauseButton.addEventListener('click', function(event) {
            activeTimer.pause()
        })
    } else {
        activeTime.style.display = 'none'
    }

    // weight & rest time display
    if (firstSet.weight) {
        const weight = exerciseDisplayDiv.querySelector('span#exercise-display-weight')
        weight.textContent = firstSet.weight
    }
    if (firstSet.rest_time) {
        const restTime = exerciseDisplayDiv.querySelector('span#exercise-display-rest-time')
        restTime.textContent = firstSet.rest_time > 1 ? `${firstSet.rest_time} seconds` : `${firstSet.rest_time} second`

        const restTimerDiv = exerciseDisplayDiv.querySelector('div#rest-timer-div')
        restTimerDiv.style.display = ''
        const restTimerDisplay = restTimerDiv.querySelector('div#rest-timer')
        const display = new Date(firstSet.rest_time * 1000).toISOString().substr(11, 8)
        restTimerDisplay.textContent = display

        const restTimerButton = restTimerDiv.querySelector('button#start-rest-timer-button')
        restTimerButton.addEventListener('click', function(event) {
            const button = event.target
            if (button.className === 'start-timer') {
                restTimer.start({countdown: true, startValues: {seconds: firstSet.rest_time}});
                restTimerDisplay.textContent = restTimer.getTimeValues().toString()

                // button.textContent = "Pause"
                // button.className = 'pause-timer'
            }
        })
        const resetButton = restTimerDiv.querySelector('button#reset-rest-timer-button')
        resetButton.addEventListener('click', function(event) {
            restTimer.reset()
            restTimer.stop()
        })
        const pauseButton = restTimerDiv.querySelector('button#pause-rest-timer-button')
        pauseButton.addEventListener('click', function(event) {
            restTimer.pause()
        })
    }
    // link display
    const refLink = exerciseDisplayDiv.querySelector('a#exercise-display-link')
    if (firstSet.exercise.ref_link) {
        refLink.href = firstSet.exercise.ref_link
    } else {
        refLink.style.display = 'none'
    }
}

async function handleNextSet() {
    // console.log('clicked')
    const allSets = Array.from(viewCard.querySelectorAll('div.one-set'))
    const lastViewedSet = allSets.find(setDiv => setDiv.classList.contains('currently-viewing'))
    lastViewedSet.classList.remove('currently-viewing')
    const lastViewedSetIndex = allSets.indexOf(lastViewedSet)

    if (lastViewedSetIndex + 1 === allSets.length - 1) {
        const nextButton = exerciseDisplayDiv.querySelector('div#next-set-button button')
        nextButton.disabled = true
    }
    const nowViewingSet = allSets[lastViewedSetIndex + 1]
    nowViewingSet.classList.add('currently-viewing')
    const nowViewingSetObj = await fetchExerciseSetById(Number(nowViewingSet.dataset.id))
    displayExerciseInfo(nowViewingSetObj, nowViewingSet)
}

function handleEditButtons(editing) {
    if (editing) {
       let buttons = document.querySelectorAll('button.edit-set-button')
       buttons.forEach(button => {
           button.className = 'disabled-edit-set-button'
           button.disabled = true
        })
    } else {
       let buttons = document.querySelectorAll('button.disabled-edit-set-button')
       buttons.forEach(button => {
           button.className = 'edit-set-button'
           button.disabled = false
        })
    }
 }
