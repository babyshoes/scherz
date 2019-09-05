
import { generate } from 'scherz'

// https://medium.com/@danilog1905/how-to-use-web-workers-with-react-create-app-and-not-ejecting-in-the-attempt-3718d2a1166b
self.addEventListener('message', (evt) => {
    // const data = JSON.parse(evt.data)
    const data = evt.data
    // const possibleType = generate.possibleTypes(data.scales)[0]
    const first = generate.initialChord(data.scales, data.tonic, data.tonicType)

    const chords = data.tensions.slice(1).reduce((acc, tension) => {
        const prevTimestep = acc.length - 1
        return [...acc, generate.nextChord(data.scales, acc[prevTimestep], tension)]
      }, [first])
    
    postMessage(chords)
})