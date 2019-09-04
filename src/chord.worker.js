
import { generate } from 'scherz'

// https://medium.com/@danilog1905/how-to-use-web-workers-with-react-create-app-and-not-ejecting-in-the-attempt-3718d2a1166b
self.addEventListener('message', (evt) => {
    // const data = JSON.parse(evt.data)
    const data = evt.data
    // console.log(`prevChord in worker: ${data.prevChord.tonic + data.prevChord.type}`)
    const nextChord = generate.nextChord(data.scales, data.prevChord, data.tension)
    postMessage([nextChord, data.timestepIndex])
})
