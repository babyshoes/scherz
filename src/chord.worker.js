
import { generate } from 'scherz'

self.addEventListener('message', (evt) => {
    // const data = JSON.parse(evt.data)
    const data = evt.data
    const nextChord = generate.nextChord(data.scales, data.prevChord, data.tension)
    postMessage([nextChord, data.timestepIndex])
})

// const self = this
// export default () => {
//     debugger
//     self.addEventListener('message', (evt) => {
//         // debugger
//         const test = JSON.parse(evt.data)

//         // const [prevChord, tension, scales] = JSON.parse(evt.data)
//         // console.log(prevChord, tension, scales)
//         debugger
//         // const [prevChord, tension, scales] = evt.data
//         // debugger
//         // const nextChord = generate.nextChord(scales, prevChord, tension)
//         // debugger
//         // postMessage(nextChord)
//         // postMessage(test[0])
//     })
// }

// self.addEventListener('message', (evt) => {
//     const [prevChord, tension, scales] = evt.data
//     const nextChord = generate.nextChord(scales, prevChord, tension)
//     postMessage(nextChord)
// })

// self.onmessage = (evt) => {
//     const [prevChord, tension, scales] = evt.data
//     const nextChord = generate.nextChord(scales, prevChord, tension)
//     self.postMessage(nextChord)
// }