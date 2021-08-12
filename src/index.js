// console logs and debugger lines have been left in as comments
// to demonstrate my debugging process (Perserverance category in rubric)

/* 
    Some issues I am aware of but didn't have time to fix:

    - UPDATE FORM ISSUE: the edit/update form is triggered to display when an
    'edit' button is clicked. Each time this is done, the event continues to 
    occur, which causes big errors. 
    - lack of form validations & error message display
    - input field effects (e.g. disable) not working as intended under all circumstances
    - issue with Add Existing Block to Workout (explained in comments around line 299)
    
    Example scenario: 
    fill out update form once -> submit -> fill and submit again 
    -> the values created when the form was opened the first time (via edit button)
    continue to exist and affect the effects of the next form instance

    the notes below are earlier logs of aformentioned issue 
    - sometimes, changing an ExerciseSet's num of set repetition (in edit form)
    will cause an extra set reptitions to be added/removed. 
        For ex - changing "ExerciseSet 1" from 3 set reps to 2 set reps
        will result in "ExerciseSet 1" containing only 1 set rep
    - sometimes, editing the num of set reps of an ExerciseSet twice 
    without refreshing the page freezes the app (likely result of infinite loop)
    - the update form in general can be messy and unpredictable. I believe it is
    because the entire form has an event listener. With every new interaction, the
    previous event listeners that were triggered are triggered again. 
    - will look into removeEventListener() in the future
    - placeholder/default names for workouts and blocks don't reset after a
    workout or block is deleted. have to refresh page to update the placeholder names

*/

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

// on page load, render all available Workout options in Block/ExerciseSet form
// add workout options to select input in Block/ExerciseSet form
fetchWorkouts().then(function(workoutsArray) {
    workoutsArray.forEach(function(workoutObj) {
        createWorkoutOption(workoutObj)
    })
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

// on page load, render all available Exercises in select input for create ExerciseSet
// add exercise options to select input in ExerciseSet form
fetchExercises().then(function(exercisesArray) {
    exercisesArray.forEach(function(exerciseObj) {
        createExerciseOption(exerciseObj)
    })
})

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

// render text for ExerciseSet detail divs
function exerciseSetDetailsLine(hasRepetitions, exerciseName, exerciseRepetitionsOrActiveTime) {
    let singleOrPlural
    if (hasRepetitions) {
        singleOrPlural = exerciseRepetitionsOrActiveTime > 1 ? "repetitions" : "repetition"
    } else {
        singleOrPlural = exerciseRepetitionsOrActiveTime > 1 ? "seconds" : "second"
    }

    return `${exerciseName}, ${exerciseRepetitionsOrActiveTime} ${singleOrPlural}`
}

// submission handling on create new Workout form
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

// on form submit, assigns default placeholder as name value for new Workout (if no user-provided name)
function autoWorkoutNameValue(input) {
    input.value = input.placeholder
}

// for now, user either provides exercise reps OR active time
// disable the other field when one is filled (for both create and edit forms)
const exerciseRepField = blockExerciseSetForm.querySelector('input.exercise-rep-num')
const activeTimeField = blockExerciseSetForm.querySelector('input.set-active-time')
exerciseRepField.addEventListener("input", function () {
    activeTimeField.disabled = this.value != ""
    activeTimeField.placeholder = 'To edit this, cannot have exercise repetitions'
    // selectBlockInput.value ? createBlockButton.style.display = '' : ''
})
activeTimeField.addEventListener("input", function () {
    exerciseRepField.disabled = this.value != ""
    exerciseRepField.placeholder = 'To edit this, cannot have active time'
    // selectBlockInput.value ? createBlockButton.style.display = '' : ''
})

// hide submit button on load
// show submit button if either field has input AND if workout select has valid value AND exercise select has valid value
const selectBlockInputInCreate = document.querySelector('form.create-block-set-form select.block-exercise-select')
const createBlockButton = blockExerciseSetForm.querySelector('input.create-block-button')
createBlockButton.style.display = 'none'
blockExerciseSetForm.addEventListener('mouseover', function() {
    if (selectBlockInputInCreate.value && exerciseSetExerciseSelectInput.value && (exerciseRepField.value || activeTimeField.value)) {
        // console.log('hello')
        createBlockButton.style.display = ''
    }
})

// submission handling on create new Block & ExerciseSet(s) form
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
    
    const [ blockNameInput, selectedWorkoutInput ] = event.target
    const selectedWorkoutId = Number(selectedWorkoutInput.value)

    const newBlock = await createBlock(selectedWorkoutId, blockNameInput)

    createWorkoutBlock(newBlock.id, selectedWorkoutId)

    // debugger

    // render Block in the associated Workout display card
    const workoutCardInfoContainer = document.querySelector(`div.card[data-id="${selectedWorkoutId}"] div.workout-info-top`)
    renderBlock(newBlock, workoutCardInfoContainer)
  
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

/* 
    NOTE: The "Add Existing Block to Workout" form adds a Block that already exists in the db
    to a Workout by creating a new WorkoutBlock association. The user can expect that adding an existing
    Block to a Workout will throw off the order of Blocks.

    For example, "Block 1" was created and added to Workout 1. Then "New Block" is created and added
    to Workout 2. If the user attempts to add the existing "Block 1" TO Workout 2, then in the database,
    Workout 2 will list "Block 1" BEFORE "New Block" (because "Block 1" was technically created before 
    "New Block" even though it was added after). I have not figured out an implementation to order by
    block addition time.

    ANOTHER NOTE: To continue the example above, Workout 2 has "Block 1" (an existing block with another
    instance in Workout 1) and "New Block". If the user deletes "Block 1" from Workout 2, it WILL NOT delete
    the block itself. Rather, it will delete the association between "Block 1" and Workout 2. "Block 1" will
    remain in Workout 1. A block is deleted when it has 0 associations to an existing workout.
*/

// when user selects a Workout to select a Block from (in the Add Existing Block Form)
const selectBlockInput = document.querySelector('form.add-existing-block-form select.select-block')
workoutSelectExistingBlock.addEventListener('change', async function(event) {
    // get all Blocks of Workout selected
    const selectedWorkout = await fetchWorkoutById(Number(event.target.value))
    const allBlocks = selectedWorkout.blocks

    // debugger

    // data attribute of the select existing Block input is id of previously selected Workout
    selectBlockInput.dataset.id = Number(event.target.value)
    selectBlockInput.style.display = '' // display the element
   
    // reset options if there are existing options
    while (selectBlockInput.querySelectorAll('option').length != 1) {
        selectBlockInput.lastChild.remove()
    }

    // create select option for each Block in previously selected Workout
    allBlocks.forEach(block => {
        const newOption = document.createElement('option')
        newOption.value = block.id
        newOption.textContent = block.name
        selectBlockInput.appendChild(newOption)
    })
})

// when a user selects an option from the Select Existing Block input, preview that block in mini display
const miniDisplay = selectExistingBlockForm.querySelector('div.mini-display')
const submitButton = selectExistingBlockForm.querySelector('input.submit-button')
selectBlockInput.addEventListener('change', function(event) {
    // find a block display of chosen block
    const workoutId = Number(event.target.dataset.id)
    const chosenBlock = Number(event.target.value)
    const existingBlockDisplay = workoutDisplay.querySelector(`div.card[data-id="${workoutId}"] div.one-block[data-id="${chosenBlock}"]`)
    const copyToDisplay = existingBlockDisplay.cloneNode(true)

    // remove previous previews if any
    if (miniDisplay.firstChild) { miniDisplay.firstChild.remove() }
    miniDisplay.appendChild(copyToDisplay)

    // display select input that asks for Workout destination (choose the Workout to add existing Block to)
    divToSelectWorkoutToAddTo.style.display = ''
    // display submit button
    submitButton.style.display = ''
})

// submission handling on Add Existing Block to Workout form
selectExistingBlockForm.addEventListener('submit', function(event) {
    event.preventDefault()
    // debugger

    // add chosen block display to destination Workout display card
    const blockInMiniDisplay = miniDisplay.querySelector('div')
    const destinationWorkoutId = event.target.destination.value
    const workoutDisplayCard = workoutDisplay.querySelector(`div.card[data-id="${destinationWorkoutId}"] div.workout-info-top`)
    workoutDisplayCard.appendChild(blockInMiniDisplay)

    // add to view card if it is open
    if (workoutViewContainer.style.display !== 'none' && workoutViewContainer.dataset.id == destinationWorkoutId) {
        const copy = blockInMiniDisplay.cloneNode(true)
        const container = viewCard.querySelector('div#block-set-container')
        container.appendChild(copy)
    }

    // create new instance of WorkoutBlock (joining the selected existing Block to selected Workout)
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

    // hide the following inputs in form
    selectBlockInput.style.display = 'none'
    divToSelectWorkoutToAddTo.style.display = 'none'
    submitButton.style.display = 'none'

    event.target.reset()
})

// when this button is clicked, add new ExerciseSet input field blocks in the Block/ExerciseSet form
addExerciseSetButton.addEventListener('click', function() {
    const newSetFormBlock = exerciseSetFormBlock.cloneNode(true)

    // reset fields
    const allInputs = newSetFormBlock.querySelectorAll('input')
    allInputs.forEach(inputField => {
        inputField.value = ''
        if (inputField.disabled) { inputField.disabled = false }
    })

    // exerciseset repetition default input back to 1
    allInputs[0].value = 1
    
    const lineBreak = document.createElement('hr')
    
    exerciseSetFormContainer.append(lineBreak, newSetFormBlock)
})

// create a given number of ExerciseSets & render ExerciseSet details in Workout display card
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

// create a Block
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

// create a given number of SetReptitions
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
    viewButton.className = 'view-workout-button'

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
    const blockName = document.createElement('h4')
    blockName.textContent = block.name
    blockNameSpan.appendChild(blockName)
    blockNameContainer.appendChild(blockNameSpan)

    // in each block, render container to store ExerciseSets
    const exerciseSetsDisplay = document.createElement('div')
    exerciseSetsDisplay.className = 'exercise-set-display'
    exerciseSetsDisplay.dataset.id = block.id

    // need to have `has_many :exercise_sets` in Block serializer
    let exerciseSetsArray = block.exercise_sets

    // sort by ExerciseSet id
    exerciseSetsArray.sort(function(a, b) {
        return a.id - b.id;
    })

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

            let isFirstRepetition = false
            if (selectedDiv === blockSetContainer) {
                    // console.log(index)

                // assign editing buttons only to the first Set display of a group of the same Set displays
                if (index === 0 || exerciseSet.id !== exerciseSetsArray[index - 1].id) {
                    // console.log(exerciseSet.id)
                    isFirstRepetition = true
                }             
            }
            renderSet(exerciseSet, exerciseSetsDisplay, isFirstRepetition)
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

    // text content
    if (exerciseSet.exercise_rep_num) {
        infoSpan.textContent = exerciseSetDetailsLine(true, exerciseSet.exercise.name, exerciseSet.exercise_rep_num)
    } else {
        infoSpan.textContent = exerciseSetDetailsLine(false, exerciseSet.exercise.name, exerciseSet.active_time)
    }
    oneSetDisplay.appendChild(infoSpan)

    // if the display is the first one a group of the same displays, add the editing mode buttons
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
    // when user clicks "View Workout" button from a display card
    if (event.target.matches('button')) {
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

// event handling in Workout view card
viewCard.addEventListener('click', async function handler(event) {
    // editing mode button
    if (event.target.matches('input[type="checkbox"]')) {
        const editModeButton = event.target
        // to turn on editing mode
        if (editModeButton.className === 'mode-off') {
            toggleEditingMode("on")
        } else if (editModeButton.className === 'mode-on') {
            toggleEditingMode("off")
        }
    } 
    // selecing "Begin Workout" button to view/play workout
    else if (event.target.matches('button#begin-workout-button')) {
        const workoutModeButton = event.target

        const editingModeButton = viewCard.querySelector('input[type="checkbox"]')
        if (editingModeButton.className === "mode-on") { toggleEditingMode("off") }

        if (workoutModeButton.className === 'mode-off') {
            toggleWorkoutMode("on")
        } else if (workoutModeButton.className === 'mode-on') {
            toggleWorkoutMode("off")
        }
    } 
    // deleting one Block instance from a Workout 
    // (removing one association -- in backend, an entire Block is deleted if it has no associations to a Workout)
    else if (event.target.matches('button.delete-block-button')) {
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

        // hide update form if open
        if (updateForm.display !== 'none') { updateForm.display = 'none' }

        // removing this WorkoutBlock instance from Workout (removing one association)
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
    } 
    // deleting a fetch
    else if (event.target.matches('button.delete-set-button')) {
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
    } 
    // deleting a workout
    else if (event.target.matches('button#delete-workout-button')) {
        const deleteWorkoutButton = event.target
        // get the selected Workout id
        const selectedWorkoutId = deleteWorkoutButton.closest('div.workout-view').dataset.id
        // hide view
        workoutViewContainer.style.display = 'none'
        toggleEditingMode("off")
        // remove the display card of this Workout
        const selectedWorkoutDisplayCard = workoutDisplay.querySelector(`div.card[data-id="${selectedWorkoutId}"]`)
        selectedWorkoutDisplayCard.remove()

        fetch(`http://127.0.0.1:3000/workouts/${selectedWorkoutId}`, {
            method: 'DELETE'
        })
    } 
    // else if (event.target.matches('div#next-set-button button')) {
    //     handleNextSet()
    // }
    // editing a set
    else if (event.target.matches('button.edit-set-button')) {
        // event.currentTarget.removeEventListener(event.type, handler); // <--- doing this would allow event to happen only once
        handleEditButtons(true)
        const editSetButton = event.target

        const selectedDiv = editSetButton.closest('div.one-set')
        // get the selected ExerciseSet id
        const selectedExerciseSetId = Number(selectedDiv.dataset.id)
        // get the selected Set
        const selectedSet = await fetchExerciseSetById(selectedExerciseSetId)

        // highlight selected divs that the user will be editing
        // account for more than one instance of the same Block in a Workout
        // (applying edits to this Block should be reflected in whatever other displays this Block is present in -- bc a Block can be reused)
        const allSameDivs = viewCard.querySelectorAll(`div.one-set[data-id="${selectedExerciseSetId}"]`)
        allSameDivs.forEach(div => div.classList.add('currently-editing'))
        // selectedDiv.classList.add('currently-editing')

        // show edit/update form
        const updateForm = viewCard.querySelector('div.edit-set-form')
        updateForm.style.display = 'block'
        updateForm.dataset.id = selectedExerciseSetId
        // console.log(selectedExerciseSetId)

        // pre-fill fields with current values
        // display appropriate placeholders in form (if existing values, display as placeholder)
        const exerciseSelect = updateForm.querySelector('select')
        const inputFieldElementsArray = updateForm.querySelectorAll('input:not([type=submit])')
        const [ setReps, exerciseReps, activeTime, restTime, weight ] = inputFieldElementsArray

        // remove values if any
        inputFieldElementsArray.forEach(field => field.value = '')

        const currentBlockId = Number(editSetButton.closest('div.one-block').dataset.id)
        const currentBlockObj = await fetchBlockById(currentBlockId)
        const origSetReps = currentBlockObj.exercise_sets.filter(set => set.id === selectedExerciseSetId).length
        // debugger
        exerciseSelect.value = selectedSet.exercise.id
        
        setReps.placeholder = origSetReps
        // debugger
        exerciseReps.placeholder = selectedSet.exercise_rep_num ? selectedSet.exercise_rep_num : ""
        activeTime.placeholder = selectedSet.active_time ? selectedSet.active_time : ""
        restTime.placeholder = selectedSet.rest_time ? selectedSet.rest_time : ""
        weight.placeholder = selectedSet.weight ? selectedSet.weight : ""

        // user can only have either exercise reps or active time
        if (selectedSet.exercise_rep_num) {
            activeTime.disabled = true
            activeTime.placeholder = 'N/A'
        } else if (selectedSet.active_time) {
            exerciseReps.disabled = true
            exerciseReps.placeholder = 'N/A'
        }

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
                    // add any new data into object
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

                // account for more than one instance of the same Block in a Workout (applying edits to this Block should be
                // reflected in whatever other displays this Block is present in -- bc a Block can be reused)
                const allSameBlocksInView = viewCard.querySelectorAll(`div.one-block[data-id="${currentBlockId}"]`)
                const allSameBlocksInDisplay = workoutDisplay.querySelectorAll(`div.one-block[data-id="${currentBlockId}"]`)

                console.log(updatedSetRepetitions)
                console.log(origSetReps)
                // remove excess displays if new set rep num is smaller
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
                    // hide update form
                    updateForm.style.display = 'none'

                    // remove highlighting
                    const allSetDivs = Array.from(viewCard.querySelectorAll('.currently-editing'))
                    allSetDivs.forEach(div => div.classList.remove('currently-editing'))
                    handleEditButtons(false)
                }
                // create new displays if new set rep num is larger
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
                    // hide update form
                    updateForm.style.display = 'none'

                    // remove any highlighting
                    const allSetDivs = Array.from(viewCard.querySelectorAll('.currently-editing'))
                    allSetDivs.forEach(div => div.classList.remove('currently-editing'))
                    handleEditButtons(false)
                }
            }
            // update text content in ExerciseSet divs if changed
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

            // update db if there are new inputs (aside from changes in number of set reps)
            if (Object.keys(updatedDataHash).length !== 0) {
                const response = await fetch(`http://127.0.0.1:3000/exercise_sets/${selectedExerciseSetId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ exercise_set: updatedDataHash })
                })

                // hide edit/update form if not already hidden
                updateForm.style.display = 'none'

                // remove highlighting
                allSameDivs.forEach(div => div.classList.remove('currently-editing'))

                handleEditButtons(false)
            }
        })
    } 
    // when user clicks "Cancel/Exit" button in update form
    else if (event.target.matches('button.cancel-edit-button')) {
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

// turning on/off editing mode
function toggleEditingMode(mode) {
    const editModeButton = viewCard.querySelector('input[type="checkbox"]')
    const allEditingButtonSpans = viewCard.querySelectorAll('span.editing-mode-buttons')
    const allDeleteBlockButtons = viewCard.querySelectorAll('button.delete-block-button')
    const deleteWorkoutButton = viewCard.querySelector('button#delete-workout-button')

    if (mode === "on") { // turning ON editing mode
        toggleWorkoutMode("off")

        // display elements appropriately
        allEditingButtonSpans.forEach(span => span.style.display = '')
        allDeleteBlockButtons.forEach(button => button.style.display = '')
        editModeButton.className = 'mode-on'
        editModeButton.textContent = 'Exit Editing Mode'
        deleteWorkoutButton.style.display = 'block'
    } else if (mode === "off") { // turning OFF editing mode
        // hide elements appropriately
        allEditingButtonSpans.forEach(span => span.style.display = 'none')
        allDeleteBlockButtons.forEach(button => button.style.display = 'none')
        deleteWorkoutButton.style.display = 'none'
        editModeButton.className = 'mode-off'
        editModeButton.checked = false

        // unhighlight any highlighted divs
        const allSets = Array.from(viewCard.querySelectorAll('div.one-set'))
        allSets.forEach(setDiv => setDiv.classList.remove('currently-editing'))

        // hide update form
        updateForm.style.display = 'none'
    }
}

// turning on/off Workout view/play mode
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

        // fetch Set
        const firstSet = await fetchExerciseSetById(firstId)

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

// timers
const restTimer = new easytimer.Timer()
const activeTimer = new easytimer.Timer()

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
    // console.log(activeTime.style.display)

    // if there is an exercise rep for this set, display
    if (firstSet.exercise_rep_num) {
        // display if previously hidden
        if (exerciseReps.style.display === 'none') { exerciseReps.style.display = '' }
        exerciseReps.textContent = firstSet.exercise_rep_num > 1 ? `${firstSet.exercise_rep_num} reps` : `${firstSet.exercise_rep_num} rep`
    } else {
        exerciseReps.style.display = 'none'
    }
    // if there is an active time for this set, display
    if (firstSet.active_time) {
        // display if previously hidden
        if (activeTime.style.display === 'none') { activeTime.style.display = '' }
        activeTime.textContent = firstSet.active_time > 1 ? `${firstSet.active_time} seconds` : `${firstSet.active_time} second`

        const activeTimerDiv = exerciseDisplayDiv.querySelector('div#active-timer-div')
        activeTimerDiv.style.display = ''
        const activeTimerDisplay = activeTimerDiv.querySelector('span#active-timer')
        const display = new Date(firstSet.active_time * 1000).toISOString().substr(11, 8)
        activeTimerDisplay.textContent = display

        const activeTimerButton = activeTimerDiv.querySelector('button#start-active-timer-button')
        handlingTimerButtons(firstSet.active_time, activeTimer, activeTimerButton, activeTimerDisplay, activeTimerDiv, '#active-timer')
    } else {
        activeTime.style.display = 'none'
    }

    // weight & rest time display
    if (firstSet.weight) {
        const weight = exerciseDisplayDiv.querySelector('span#exercise-display-weight')
        weight.textContent = firstSet.weight > 1 ? `${firstSet.weight} lbs` : `${firstSet.weight} lb`
    }
    if (firstSet.rest_time) {
        const restTime = exerciseDisplayDiv.querySelector('span#exercise-display-rest-time')
        restTime.textContent = firstSet.rest_time > 1 ? `${firstSet.rest_time} seconds` : `${firstSet.rest_time} second`

        const restTimerDiv = exerciseDisplayDiv.querySelector('div#rest-timer-div')
        restTimerDiv.style.display = ''
        const restTimerDisplay = restTimerDiv.querySelector('span#rest-timer')
        const display = new Date(firstSet.rest_time * 1000).toISOString().substr(11, 8)
        restTimerDisplay.textContent = display

        const restTimerButton = restTimerDiv.querySelector('button#start-rest-timer-button')
        handlingTimerButtons(firstSet.rest_time, restTimer, restTimerButton, restTimerDisplay, restTimerDiv, '#rest-timer')
    }
    // link display
    const refLink = exerciseDisplayDiv.querySelector('a#exercise-display-link')
    if (firstSet.exercise.ref_link) {
        refLink.href = firstSet.exercise.ref_link
    } else {
        refLink.style.display = 'none'
    }
}

// button handling for start, pause, reset timer
function handlingTimerButtons(startTime, timer, button, timerDisplay, timerDiv, htmlId) {
    button.addEventListener('click', function(event) {
        const button = event.target
        if (button.className === 'start-timer') {
            timer.start({countdown: true, startValues: {seconds: startTime}});
            timerDisplay.textContent = timer.getTimeValues().toString()
        }
    })
    const resetButton = timerDiv.querySelector('button.reset-timer')
    resetButton.addEventListener('click', function(event) {
        timer.reset()
        timer.stop()
    })
    const pauseButton = timerDiv.querySelector('button.pause-timer')
    pauseButton.addEventListener('click', function(event) {
        timer.pause()
    })

    timer.addEventListener('secondsUpdated', function(event) {
        document.querySelector(htmlId).textContent = timer.getTimeValues().toString()
    })
    timer.addEventListener('started', function (event) {
        document.querySelector(htmlId).textContent = timer.getTimeValues().toString()
    });
    timer.addEventListener('reset', function (event) {
        document.querySelector(htmlId).textContent = timer.getTimeValues().toString()
    });
}

// display the next set in the Workout (when user is going through the workout with the "Next Set" button)
const nextButton = exerciseDisplayDiv.querySelector('div#next-set-button button')
nextButton.addEventListener('click', (event) => handleNextSet(event))
async function handleNextSet(event) {
    event.stopPropagation()
    // console.log('clicked')
    const allSets = Array.from(viewCard.querySelectorAll('div.one-set'))
    const lastViewedSet = allSets.find(setDiv => setDiv.classList.contains('currently-viewing'))
    if (lastViewedSet) { lastViewedSet.classList.remove('currently-viewing') }
    const lastViewedSetIndex = allSets.indexOf(lastViewedSet)

    if (lastViewedSetIndex + 1 === allSets.length - 1) {
        const nextButton = exerciseDisplayDiv.querySelector('div#next-set-button button')
        nextButton.disabled = true
    }
    const nowViewingSet = allSets[lastViewedSetIndex + 1]
    // nowViewingSet.classList.add('currently-viewing')
    const nowViewingSetObj = await fetchExerciseSetById(Number(nowViewingSet.dataset.id))
    displayExerciseInfo(nowViewingSetObj, nowViewingSet)
}

// when edit form is opened, disable other edit buttons
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
