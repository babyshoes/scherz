
import { generate } from 'scherz'

// https://medium.com/@danilog1905/how-to-use-web-workers-with-react-create-app-and-not-ejecting-in-the-attempt-3718d2a1166b
self.addEventListener('message', (evt) => {
    const scales = evt.data
    const types = generate.possibleTypes(scales)
    
    postMessage(types)
})

