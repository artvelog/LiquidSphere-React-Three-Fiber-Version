import * as THREE from 'three'
import React, { useEffect, useMemo } from 'react'
import { useFrame, Canvas} from '@react-three/fiber'

import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";
import { ThinFilmFresnelMap } from './ThinFilmFresnelMap';

export const LiquidSphere = (props) => {
    let mousePos = new THREE.Vector2(0, 0);

    const getNormalizedMousePos = (e) => {
        return {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1
        };
    };

    function setMousePos(e) {
        const { x, y } = getNormalizedMousePos(e);
        mousePos.x = x;
        mousePos.y = y;
    }

    function trackMousePos() {
        window.addEventListener("mousemove", (e) => {
            setMousePos(e);
        });
        window.addEventListener("touchstart", (e) => {
            setMousePos(e.touches[0]);
        }, { passive: false });
        window.addEventListener("touchmove", (e) => {
            setMousePos(e.touches[0]);
        });
    }

    const map = new ThinFilmFresnelMap(1000, 1.2, 3.2, 128);
    map.texture.needsUpdate = true;

    const w_uniforms = useMemo(() => {
        return {
            uTime: { value: 0 },
            uResolution: {value: new THREE.Vector2(window.innerWidth * 4, window.innerHeight * 4)},
            uMouse: {value: new THREE.Vector2(0, 0)},
            uIriMap: {value: map.texture},
            uIriBoost: {value: 80}
        };
    });

    const waterMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
        uniforms: w_uniforms
    });
    const geometry = new THREE.SphereGeometry(10, 64, 64);

    useEffect(() => {
        trackMousePos();
    });

    useFrame((state) => {
        const { clock } = state;
        const elapsedTime =  clock.getElapsedTime();
        const time = elapsedTime * 0.1;
        
        if (waterMaterial) {
            w_uniforms.uTime.value = time;
            w_uniforms.uMouse.value = mousePos;
        }
    });


    return(
        <>
            <mesh
                scale={0.2}
                position={[0, 0, 0]}
                geometry={geometry}
                material={waterMaterial}
            />
        </>
    );
}

export const LiquidSphereContainer = (props) => {
    return(
    <>
        <Canvas>
            {props.children}
        </Canvas>
    </>
    );
}

