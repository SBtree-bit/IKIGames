import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import * as THREE from 'three'

async function createBackground(scene) {
    let texture = await new RGBELoader()
        .setPath('textures/equirectangular/')
        .loadAsync('sky.hdr')

    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = texture;
    scene.environment = texture;
}
export default createBackground;