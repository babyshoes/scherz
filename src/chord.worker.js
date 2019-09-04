
import { generate } from 'scherz'

// https://medium.com/@danilog1905/how-to-use-web-workers-with-react-create-app-and-not-ejecting-in-the-attempt-3718d2a1166b
self.addEventListener('message', (evt) => {
    // const data = JSON.parse(evt.data)
    const data = evt.data

    // console.log(`prevChord in worker: ${data.prevChord.tonic + data.prevChord.type}`)
    let nextChord = null
    if (data.timestepIndex > 0) {
        nextChord = generate.nextChord(data.scales, data.prevChord, data.tension)
    } else {
        const possibleType = generate.possibleTypes(data.scales)[0]
        nextChord = generate.initialChord(data.scales, data.tonic, possibleType)
    }
    
    postMessage([nextChord, data.timestepIndex])
})
