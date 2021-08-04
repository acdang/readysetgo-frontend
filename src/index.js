const workoutForm = document.querySelector('form.create-workout-form')
const workoutNameInput = document.querySelector('form.create-workout-form input#workout-name')

function fetchWorkouts() {
    return fetch('http://127.0.0.1:3000/workouts')
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
        body: JSON.stringify({
            name: workoutName.value
        }),
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
        }
    })
    event.target.reset()
})
