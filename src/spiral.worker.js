
import { brightness } from 'scherz'
import _ from 'lodash'

// https://medium.com/@danilog1905/how-to-use-web-workers-with-react-create-app-and-not-ejecting-in-the-attempt-3718d2a1166b
self.addEventListener('message', (evt) => {
    const chordList = evt.data
    const chordsByBrightness = _.orderBy(chordList, [function(chord) {return brightness.scaleBrightness(chord.tonic, chord.scale)}])
    const darkest = _.first(chordsByBrightness),
          brightest = _.last(chordsByBrightness)
    
    const darkestFifths = brightness.circleOfFifths(darkest.tonic, darkest.scale),
          brightestFifths = brightness.circleOfFifths(brightest.tonic, brightest.scale)
    
    let circleOfFifths = brightness.fifthsBetween(_.first(darkestFifths), _.last(brightestFifths))
    while (circleOfFifths.length < 36) {
      if (circleOfFifths.length % 2) {
        circleOfFifths.push(brightness.fifthsAbove(1, _.last(circleOfFifths)))
      } else {
        circleOfFifths = [brightness.fifthsAbove(-1, _.first(circleOfFifths)), ...circleOfFifths]
      }
    }
    
    postMessage(circleOfFifths)
})

