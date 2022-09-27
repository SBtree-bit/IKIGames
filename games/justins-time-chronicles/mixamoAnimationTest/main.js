import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import loadModels from '../js/loadAnims.js';
(async () => {
    var i = 0;
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA)
    var light = new THREE.PointLight();
    light.position.set(2.5, 7.5, 15);
    scene.add(light);
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0.8, 1.4, 1.0);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1, 0);
    var modelReady = false;
    var animationActions;
    var activeAction;
    var lastAction;
    var mixer;
    ({animationActions, mixer, activeAction, modelReady} = await loadModels('models/vanguard_t_choonyung.fbx', ['models/vanguard@samba.fbx', 'models/vanguard@bellydance.fbx', 'models/vanguard@idle.fbx'], mixer, activeAction, scene, modelReady))
    console.log(mixer)
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }
    var animations = {
        default: function () {
            setAction(animationActions[0]);
        },
        samba: function () {
            setAction(animationActions[1]);
        },
        bellydance: function () {
            setAction(animationActions[2]);
        },
        goofyrunning: function () {
            setAction(animationActions[3]);
        }
    };
    var setAction = function (toAction) {
        if (toAction != activeAction) {
            lastAction = activeAction;
            activeAction = toAction;
            //lastAction.stop()
            lastAction.fadeOut(1);
            activeAction.reset();
            activeAction.fadeIn(1);
            activeAction.play();
        }
    };
    setInterval(() => {
        setAction(animationActions[i])
        if ((i + 1) == animationActions.length) {
            i = 0;
        } else {
            i++;
        }
    }, 5000)
    var clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        if (modelReady)
            mixer.update(clock.getDelta());
        render();
    }
    function render() {
        renderer.render(scene, camera);
    }
    animate();
})()