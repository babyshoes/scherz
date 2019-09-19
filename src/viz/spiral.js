// import { Scene, Color } from 'three';
// import { CatmullRomCurve3, BufferGeometry, LineBasicMaterial, Line, Geometry} from 'three';
// import { LineSegments, OrbitControls } from 'three';

import OrbitControls from 'three-orbitcontrols'
import * as THREE from 'three'
import _ from 'lodash'
import { Camera } from 'three';
import { brightness } from 'scherz';

// const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F']

// TO DO: 
// - make line weight and label text size dynamic
const buildScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#574e5c");

    return scene;
}

// const buildCamera = (width, height) => {
const buildCamera = () => {
    const fov = 45
    // const aspectRatio = width/height
    const aspectRatio = 1
    const nearPlane = 1
    const farPlane = 500

    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
    camera.position.z = -30;
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    return camera
}

const refocusCamera = (camera, width, height) => {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

const buildRenderer = () => {
// const buildRenderer = (ref, width, height) => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    // renderer.setSize(width, height)

    // hmmm not a gr8 place for this
    // renderer.domElement.classList.add("shift-off")
    // ref.current.appendChild(renderer.domElement)
    // renderer.domElement.style.width = '100%'
    // renderer.domElement.style.height = '100%'

    return renderer
}

const attachRenderer = (renderer, ref, width, height) => {
    renderer.setSize(width, height)
    if(ref.current.children.length===0) {
        ref.current.appendChild(renderer.domElement)
    }
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
}

const getNumRevs = (spiralRange) => {
    return spiralRange.length / 12
}

const calculateSpiralPoints = (topY, bottomY, spiralRange) => {
    const numRevs = getNumRevs(spiralRange)
    // const numRevs = 2
    const stepsPerRev = 120
    const radian = (Math.PI * 2) / stepsPerRev

    const totalHeight = (topY - bottomY)/2
    const diameter = totalHeight
    const deltaY = totalHeight / (stepsPerRev)

    const spiralPoints = []
    for (let numstep = 0; numstep < stepsPerRev * numRevs; numstep++) {
        
        let x = diameter * Math.cos(radian * numstep)
        let z = diameter * Math.sin(radian * numstep)
        let y = bottomY + (deltaY * numstep)

        let newPt = new THREE.Vector3(x, y, z);

        spiralPoints.push(newPt);
    }
    return spiralPoints
}

const drawMarker = (scene, x, y, z, pitch) => {
    // var radius = 0.2,
    // segments = 12,
    // material = new THREE.LineBasicMaterial( { color: 'white' } ),
    // geometry = new THREE.CircleGeometry( radius, segments );
    // Remove center vertex
    // geometry.vertices.shift();
    // var mesh = new THREE.LineLoop( geometry, material )

    const geometry = new THREE.SphereGeometry(
        // 0.4, 20, 20);
        0.3, 3, 2);
    const material = new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = pitch
    mesh.position.set(x, y, z);
    scene.add(mesh)

    return mesh
}


const drawNoteMarkers = (spiralRange, scene, points) => {
    // if scene has notemarkers, tear down
    let markers = []
    const spiralLength = spiralRange.length // 24
    // debugger
    for (let i=0; i<spiralLength; i++) {
        // let numPt = 2400 * i / 24
        let numPt = Math.round(points.length * i / spiralLength) // hmmmm that 2400
        let pitch = spiralRange[i] || ""
        // let pitch = circleOfFifths[i] || ""
        let ptMesh = drawMarker(scene, points[numPt].x, points[numPt].y, points[numPt].z, pitch)
        markers.push(ptMesh)
    }

    return markers
}

// https://codepen.io/dxinteractive/pen/reNpOR
const textLabel = function(ref) {
    const textDiv = document.createElement('div')
    textDiv.className = "note-label invisible shift-off"
    textDiv.style.position = "absolute"

    return {
        element: textDiv,
        parent: null,
        position: new THREE.Vector3(0,0,0),
        ref: ref,
        setHTML: function (note) {
            this.element.innerHTML = note
        },
        setParent: function (mesh){this.parent = mesh},
        updatePosition: function (ref, camera) {
            if (this.parent) {
                this.position.copy(this.parent.position)
            }
            const coords2d = this.get2DCoords(ref, this.position, camera);
            this.element.style.left = coords2d.x + 'px'
            this.element.style.top = coords2d.y + 'px'
            
        },
        get2DCoords: function(ref, position, camera) {
            if (!ref.current) {debugger}
            if (ref.current === null) {debugger}
            const width = ref.current.offsetWidth
            
            const height = ref.current.offsetHeight
            const vector = position.project(camera)
   
            const otherDivsWidth = Array.from(document.getElementsByClassName("panel"))
                .filter(el => !el.className.includes("right"))
                .reduce((acc, el) => Number(el.clientWidth) + acc, 0)

            // since it's an absolute position, gotta account for flexbox width of left side
            vector.x = (vector.x + 1)/2 * width + otherDivsWidth
            vector.y = -(vector.y - 1)/2 * height

            return vector
        }        
    }
}

const activateTextLabels = (labels, chord) => {
    labels.forEach(l => {
        if (chord.pitches.includes(l.parent.name)) {
            l.element.classList.add("active")
        } else {
            l.element.classList.remove("active")
        }
    })
}

const createTextLabels = (ref, camera, markers) => {
    const positionedLabels = markers.map(ptMesh => {
        const label = textLabel(ref)
        label.setHTML(ptMesh.name)
        label.setParent(ptMesh) 
        ref.current.appendChild(label.element)
        
        label.updatePosition(ref, camera)
        return label
    })

    return positionedLabels
}

// const createTextLabels = (ref, camera, markers, circle) => {
//     const positionedLabels = markers.map(ptMesh => {
//         if(circle.includes(ptMesh.name)) {
//             const label = textLabel(ref)
//             label.setHTML(ptMesh.name)
//             label.setParent(ptMesh) 
//             ref.current.appendChild(label.element)
            
//             label.updatePosition(ref, camera)
//             return label
//         }
//     })

//     return positionedLabels
// }

const getVector3s = (noteMarkers, chord) => {
    return [...chord.pitches]
        .sort((a,b) => brightness.pitchBrightness(a) - brightness.pitchBrightness(b))
        .map((pitch, i) => 
        noteMarkers.find((marker, index) => {
            // const octave = chord.notes[i] - 72
            return pitch.toLowerCase() === marker.name.toLowerCase() // && index >= (octave * 12)
        }).position
    )
    // return chord.pitches.map((pitch, i) => 
    //     noteMarkers.find((marker, index) => {
    //         // const octave = chord.notes[i] - 72
    //         return pitch.toLowerCase() === marker.name.toLowerCase() // && index >= (octave * 12)
    //     }).position
    // )
}

const getRelCircle = (chord) => {
    return brightness.circleOfFifths(chord.tonic, chord.scale)
}

const drawChordPlane = (scene, noteMarkers, chord, color) => {
    // const colorChoices = ['#e27d60', '#c38d9e', '#e8a87c', '#85dcb', '#41b3a3']
    // const colorChoices = ['#3da4ab', '#f6cd61', '#fe8a71']

    const chordVector3s = getVector3s(noteMarkers, chord)
    const geometry = new THREE.Geometry()
    geometry.vertices.push(...chordVector3s)
    // geometry.faces.push(new THREE.Face3(0, 3, 2), new THREE.Face3(0, 1, 3))
    geometry.faces.push(new THREE.Face3(2, 1, 0), new THREE.Face3(3, 2, 0))
    const material = new THREE.MeshBasicMaterial( {
        // color:0x00ff00, 
        // color: '#41b3a3',
        // color: _.sample(colorChoices),
        color: color,
        side: THREE.DoubleSide,
        // transparent: true,
        // opacity: 0.7
     })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = `chord-${chord.name}`
    scene.add(mesh)
    return mesh
}

const removeLabels = (ref) => {
    Array.from(ref.current.childNodes)
        .filter(n => n.className.includes("note-label"))
        .forEach(n => n.remove())
    // console.log(ref.current.childNodes.length)
    // let ct = 0
    // debugger
    // ref.current.childNodes.forEach(n => { 
    //     if(n.className.includes("note-label")) {
    //         n.remove()
    //         ct += 1
    //         n.parentNode.removeChild(n)
    //     }
    // })
    // console.log(ct)
    // console.log(ref.current.childNodes.length)
    // debugger
}


const removeChordPlane = (scene) => {
    const chordPlaneMesh = scene.children.find(m => m.name.slice(0,5) === "chord")
    if (chordPlaneMesh) {
        scene.remove(chordPlaneMesh)
    }
}

const removeNoteMarkers = (scene, markers) => {
    scene.remove.apply(scene, markers) 
}

const fadePrevPlanes = (scene) => {
    const meshes = scene.children.filter(m => m.name.slice(0,5) === "chord")
    if(meshes.length > 0) {
        meshes.forEach(mesh => mesh.material.opacity = Math.max(0, mesh.material.opacity - 0.3))
    }
}

const getCatmullPoints = (spiralRange) => {
    // const spiralPoints = calculateSpiralPoints(10, -10)
    const spiralPoints = calculateSpiralPoints(4, -4, spiralRange)
    const curve = new THREE.CatmullRomCurve3(spiralPoints)
    return curve.getPoints(2400)
}
const drawSpiralMesh = (scene, points) => {
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { linewidth: 2.0, color : "white" } );
    var curveObject = new THREE.Line( geometry, material );

    scene.add(curveObject)

    return [points, curveObject]
}

const buildControls = (camera, container) => {
    const controls = new OrbitControls(camera, container)
    controls.enableZoom = false;
    return controls
}

const handleWindowResize = (ref, camera, renderer) => () => {
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    renderer.setSize( width, height );
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    refocusCamera(camera, width, height)
    // camera.aspect = width / height;
    // camera.updateProjectionMatrix();
}

export const makeSpiral = function () {
    // ref.current.style.width = '100%'
    // ref.current.style.height = '100%'
    // const width = ref.current.offsetWidth
    // const height = ref.current.offsetHeight

    const scene = buildScene()
    const camera = buildCamera()
    const renderer = buildRenderer()
    // const controls = buildControls(camera, ref.current)

    // const points = getCatmullPoints()
    // const spiralMesh = drawSpiralMesh(scene, points)
    // const markers = drawNoteMarkers(spiralRange, scene, points)
    // const labels = createTextLabels(ref, camera, markers)

    // const chordPlane = drawChordPlane(scene, markers, chord)
    // window.addEventListener('resize', handleWindowResize(ref, camera, renderer))
    
    // function animate() {
    //     requestAnimationFrame( animate );
    //     if (labels) {labels.forEach(l => l.updatePosition(camera))}
    //     renderer.render( scene, camera )
    // }

    // animate()

    // function animate(_this) {
    //     requestAnimationFrame( animate )
    //     // debugger
    //     // if (!_this.ref.current) {debugger}
    //     if (_this.labels) {
    //         debugger
    //         _this.labels.forEach(l => l.updatePosition(_this.ref, camera))
    //     }
    //     // if (_this.labels) {_this.labels.forEach(l => l.updatePosition(_this.ref, camera))}
    //     renderer.render( scene, camera )
    // }

    return {
        // ref: ref,
        // spiralRange: spiralRange,
        // markers: markers,
        // labels: labels,

        build: function (ref, spiralRange) {
            if (!ref) {debugger}
            this.spiralRange = spiralRange
            this.ref = ref
            this.ref.current.style.width = '100%'
            this.ref.current.style.height = '100%'
            const width = this.ref.current.offsetWidth
            const height = this.ref.current.offsetHeight

            // this.scene = buildScene()
            refocusCamera(camera, width, height)
            attachRenderer(renderer, this.ref, width, height)
            buildControls(camera, this.ref.current)
            // this.camera = buildCamera(width, height)
            // this.renderer = buildRenderer(this.ref, width, height)
            // this.controls = buildControls(camera, this.ref.current)
            this.points = getCatmullPoints(this.spiralRange)
            this.spiralMesh = drawSpiralMesh(scene, this.points)
            // removeLabels(this.ref)

            this.draw(this.spiralRange)
            // this.markers = drawNoteMarkers(this.spiralRange, scene, this.points)
            // this.labels = createTextLabels(this.ref, camera, this.markers)
            
            // debugger
            // renderer.domElement.classList.add("shift-off", "invisible")
            // this.labels.forEach(l => l.element.classList.add("shift-off", "invisible"))
            window.addEventListener('resize', handleWindowResize(this.ref, camera, renderer))
            
            const _this = this

            function animate() {
                requestAnimationFrame( animate )
                if (!_this.ref.current) {console.log(ref); debugger}
                if (_this.ref.current === null) {debugger}
                if (_this.labels) {
                    // removeLabels(_this.ref)
                    // _this.labels = createTextLabels(_this.ref, camera, _this.markers, _this.circle)
                    _this.labels.forEach(l => {if(l){ l.updatePosition(_this.ref, camera) }} )
                }
                // if (_this.labels) {_this.labels.forEach(l => l.updatePosition(_this.ref, camera))}
                renderer.render( scene, camera )
            }
            animate()
        }, 

        rebuild: function(spiralRange) {
            this.spiralRange = spiralRange
            this.tearDown()
            // this.points = getCatmullPoints(this.spiralRange)
            // this.spiralMesh = drawSpiralMesh(scene, this.points)
            
            this.draw()

        },

        draw: function () {
            this.markers = drawNoteMarkers(this.spiralRange, scene, this.points)
            this.labels = createTextLabels(this.ref, camera, this.markers)
        },

        tearDown: function () {
            removeLabels(this.ref)
            this.labels = []
            removeNoteMarkers(scene, this.markers)
            this.markers = []
        },
       
        updateChordPlane: function (chord, color) {
            // this.circle = getRelCircle(chord)
            console.log("drawing chord plane")
            removeChordPlane(scene)
            // fadePrevPlanes(scene)
            drawChordPlane(scene, this.markers, chord, color)
            activateTextLabels(this.labels, chord)
        }   
    }
}

// export const spiral = makeSpiral()

// const spiral = drawSpiral()
// export default spiral