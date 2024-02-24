import { Float, Text, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useState } from 'react'
import { useMemo } from 'react'
import { useRef } from 'react'
import * as Three from 'three'

const boxGeometry = new Three.BoxGeometry(1,1,1)

const floor1Material = new Three.MeshStandardMaterial({color: "limegreen"})
const floor2Material = new Three.MeshStandardMaterial({color: "greenyellow"})
const obstacleMaterial = new Three.MeshStandardMaterial({color: "orangered"})
const wallMaterial = new Three.MeshStandardMaterial({color: "slategrey"})

export function BlockStart( {position = [0, 0, 0]}) {
  return (
    <group position={position}>
        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
        <Text
            font="./bebas-neue-v9-latin-regular.woff"
            scale={ 0.5 }
            maxWidth={ 0.25 }
            lineHeight={ 0.75 }
            textAlign="right"
            position={ [ 0.75, 0.65, 0 ] }
            rotation-y={ - 0.25 }
        >
            Marble Race
            <meshBasicMaterial toneMapped={ false } />
        </Text>
        </Float>
    <mesh geometry={boxGeometry} material={floor1Material} scale={[4,0.2,4]} position={[0, -0.1, 0]} receiveShadow/>

    </group>
  )
}

export function BlockEnd( {position = [0, 0, 0]}) {
    const hamburger = useGLTF("./hamburger.glb")

    hamburger.scene.children.forEach((mesh) => mesh.castShadow = true)
  return (
    <group position={position}>
        <Text
    font="./bebas-neue-v9-latin-regular.woff"
    scale={ 1 }
    position={ [ 0, 2.25, 2 ] }
>
    FINISH
    <meshBasicMaterial toneMapped={ false } />
</Text>
    <mesh geometry={boxGeometry} material={floor1Material} scale={[4,0.2,4]} position={[0, -0.1, 0]} receiveShadow/>
    <RigidBody type='fixed' colliders="hull" position={[0, 0.25, 0]} friction={0} restitution={0.2}>
        <primitive scale={0.2} object={hamburger.scene} />
    </RigidBody>
    </group>
  )
}

export function BlockSpinner( {position = [0, 0, 0]}) {
    const obstacleRef = useRef()
    const [speed] = useState((Math.random() + 0.2) * (Math.random() < 0.5 ? 1 : -1))

    useFrame((state) => {
        const time = state.clock.elapsedTime

        const rotation = new Three.Quaternion()
        rotation.setFromEuler(new Three.Euler(0, time * speed, 0))
        obstacleRef.current?.setNextKinematicRotation(rotation)
    }, [])

  return (
    <group position={position}>
    <mesh geometry={boxGeometry} material={floor2Material} scale={[4,0.2,4]} position={[0, -0.1, 0]} receiveShadow/>
    <RigidBody ref={obstacleRef} type='kinematicPosition' position={[0, 0.3, 0]} restitution={0.2} friction={0}>
    <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />

    </RigidBody>
    </group>
  )
}

export function BlockLimbo( {position = [0, 0, 0]}) {
    const obstacleRef = useRef()
    const [timeOffset] = useState(Math.random() * Math.PI * 2)

    useFrame((state) => {
        const time = state.clock.elapsedTime

        const y = Math.sin(time + timeOffset) + 1.15
        obstacleRef.current?.setNextKinematicTranslation({x: position[0], y: position[1] + y, z: position[2]})
    }, [])

  return (
    <group position={position}>
    <mesh geometry={boxGeometry} material={floor2Material} scale={[4,0.2,4]} position={[0, -0.1, 0]} receiveShadow/>
    <RigidBody ref={obstacleRef} type='kinematicPosition' position={[0, 0.3, 0]} restitution={0.2} friction={0}>
    <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />

    </RigidBody>
    </group>
  )
}

export function BlockAxe( {position = [0, 0, 0]}) {
    const obstacleRef = useRef()
    const [timeOffset] = useState(Math.random() * Math.PI * 2)

    useFrame((state) => {
        const time = state.clock.elapsedTime

        const x = Math.sin(time + timeOffset) * 1.25
        obstacleRef.current?.setNextKinematicTranslation({x: position[0] + x, y: position[1] + 0.75, z: position[2]})
    }, [])

  return (
    <group position={position}>
    <mesh geometry={boxGeometry} material={floor2Material} scale={[4,0.2,4]} position={[0, -0.1, 0]} receiveShadow/>
    <RigidBody ref={obstacleRef} type='kinematicPosition' position={[0, 0.3, 0]} restitution={0.2} friction={0}>
    <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[1.5, 1.5, 0.3]} castShadow receiveShadow />

    </RigidBody>
    </group>
  )
}

function Bounds({length})  {
    return <>
        <RigidBody type='fixed' restitution={0.2} friction={0}>
            <mesh position={[2.15, 0.75, -(length * 2) + 2]} geometry={boxGeometry} material={wallMaterial} scale={[0.3, 1.5, 4 * length]} castShadow />
            <mesh position={[-2.15, 0.75, -(length * 2) + 2]} geometry={boxGeometry} material={wallMaterial} scale={[0.3, 1.5, 4 * length]} receiveShadow />
            <mesh position={[0, 0.75, -(length * 4) + 2]} geometry={boxGeometry} material={wallMaterial} scale={[4, 1.5, 0.3]} receiveShadow />
            <CuboidCollider args={[2, 0.1, 2*length]} position={[0, -0.1, -(length * 2) + 2]} restitution={0.2} friction={1} />
        </RigidBody>
    </>
}


export function Level({count = 5, types = [BlockSpinner, BlockAxe, BlockLimbo], seed}) {
  
    const blocks = useMemo(() => {
        const blocks = []
        for (let i = 0; i < count; i++) {
            blocks.push(types[Math.floor(Math.random() * types.length)])
        }
        return blocks
    }, [count, types, seed])

    return (
    <>
        <BlockStart position={[0, 0, 0]}/>
        {
            blocks.map((Block, i) => <Block key={i} position={[0, 0, - (i  + 1) *  4]} />)
        }
        <BlockEnd position={[0, 0, - (count + 1) * 4]} />
        <Bounds length={count + 2}/>
    </>

  )
}