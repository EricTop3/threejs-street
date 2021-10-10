import Env from './env'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export default class Street {

  constructor() {
    this.env = new Env()
    this.scene = this.env.scene
    this.camera = this.env.camera
    this.pane = this.env.pane
    this.controls = this.env.controls
    this.carPosition = new THREE.Vector3()
    this.carLookAt = new THREE.Vector3()
    this.time = 0

    this.params = {
      speed: 0.5,
      fpsMode: false
    }

    this._setPane()
    this._loadModel()
    this._loadCarModel()
    this._createCurvePath()
  }

  _setPane() {
    this.folder = this.pane.addFolder({
      title: '小车参数'
    })
    this.folder.addInput(this.params, 'speed', {
      min: 0.1,
      max: 2,
      step: 0.01,
      label: '速度'
    })
    this.folder.addInput(this.params, 'fpsMode', {
      label: '第一人称视角'
    }).on('change', e => {
      if(!e.value) {
        this.controls.target = new THREE.Vector3()
        this.camera.position.set(10, 10, 5)
        this.camera.lookAt(new THREE.Vector3())
      }
    })
  }

  _createCurvePath() {

    // const helper = new THREE.AxesHelper(10)
    // this.scene.add(helper)

    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3( 2.8, 0, -3.5 ),
      new THREE.Vector3( 2.8, 0, 1.2 ),
      new THREE.Vector3( 2.8, 0, 2.2 ),
      new THREE.Vector3( 2.6, 0, 2.6 ),
      new THREE.Vector3( 2.4, 0, 2.7 ),
      new THREE.Vector3( 1, 0, 2.9 ),
      new THREE.Vector3( -3, 0, 2.9 ),
    ])
  
  }

  _loadModel() {
    const texture = new THREE.TextureLoader().load('texture/base.jpg')
    texture.flipY = false
    texture.encoding = THREE.sRGBEncoding
    this.loader = new GLTFLoader()
    this.loader.load('model/street.glb', glb => {
      glb.scene.traverse(child => {
        if(child instanceof THREE.Mesh) {
          child.material = new THREE.MeshBasicMaterial({
            map: texture
          })
        }
      })
      this.scene.add(glb.scene)
    })
  }
  

  _loadCarModel() {
    const texture = new THREE.TextureLoader().load('texture/car.jpg')
    texture.flipY = false
    texture.encoding = THREE.sRGBEncoding
    this.loader = new GLTFLoader()
    this.loader.load('model/car.glb', glb => {
      glb.scene.traverse(child => {
        if(child instanceof THREE.Mesh) {
          console.log(child)
          child.material = new THREE.MeshBasicMaterial({
            map: texture
          })
        }
      })
      glb.scene.position.set(5, 10, 10)
      this.scene.add(glb.scene)
      this.car = glb.scene
    })
  }

  update() {
    if(this.car) {
      this.time += 10
      const looptime = 5 * 1000 * (2.1 - this.params.speed)
      const t = ( this.time % looptime ) / looptime
      const nt = t + 0.2 > 1 ? 1 : t + 0.2
      
      
      this.curve.getPointAt(t, this.carPosition)
      this.curve.getPointAt(nt, this.carLookAt)
      if(this.params.fpsMode) {
        this.carPosition.y += 0.6
        this.carLookAt.y += 0.6
        this.camera.position.copy(this.carPosition)
        this.camera.lookAt(this.carLookAt)
        this.controls.target = this.carPosition
        this.car.visible = false
      } else {
        this.carPosition.y += 0.06
        this.carLookAt.y += 0.06
        this.car.position.copy(this.carPosition)
        this.car.lookAt(this.carLookAt)
        this.car.visible = true
      }
      
      
    }
  }

}