import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import * as THREE from 'three'
import { useState, useRef, useEffect } from "react";
import useGame from "./store/useGame";

export default function Player() {
    const [subscribeKeys, getKeys] = useKeyboardControls()
    const bodyRef = useRef()
    const {rapier, world} = useRapier()
    const [smoothedCameraPosition] = useState(new THREE.Vector3(10, 10, 10))
    const [smoothedCameraTarget] = useState(new THREE.Vector3())
    const start = useGame(state => state.start)
    const restart = useGame(state => state.restart)
    const end = useGame(state => state.end)
    const blocksCount = useGame(state => state.blocksCount)

    const jump = () => {
        const origin = bodyRef.current.translation()
        origin.y -= 0.31
        const direction = {x: 0, y: -1, z: 0}
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true)

        if(hit.toi < 0.15){
            bodyRef.current.applyImpulse({ x: 0, y: 0.5, z: 0})
        }
    }

    const reset = () => {
        bodyRef.current.setTranslation({x: 0, y: 1, z: 0})
        bodyRef.current.setLinvel({x: 0, y: 0, z: 0})
        bodyRef.current.setAngvel({x: 0, y: 0, z: 0})
    }

    useEffect(() => {
        const unsubscribeReset = useGame.subscribe(state => state.phase, (value) => {
            if(value === "ready") reset()
        })

      const unsubscribeJump = subscribeKeys((state) => state.jump, (value) => {
        if(value) jump()
      })

      const unsubscribeAny = subscribeKeys(() => {
        start()
      })
      
      return () => {
        unsubscribeJump()
        unsubscribeAny()
        unsubscribeReset()
      }
    }, [])
    

    useFrame((state, delta) => {
        const {forward, backward, leftward, rightward} = getKeys()

        const impulse = {x: 0, y: 0, z: 0}
        const torqueImpulse = {x: 0, y: 0, z: 0}

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        if(forward) {
            impulse.z -= impulseStrength
            torqueImpulse.x -= torqueStrength
        }

        if(leftward) {
            impulse.x -= impulseStrength
            torqueImpulse.z += torqueStrength
        }

        if(rightward) {
            impulse.x += impulseStrength
            torqueImpulse.z -= torqueStrength
        }

        if(backward) {
            impulse.z += impulseStrength
            torqueImpulse.x += torqueStrength
        }

        bodyRef.current?.applyImpulse(impulse)
        bodyRef.current?.applyTorqueImpulse(torqueImpulse)

        //camera
        const bodyPosition = bodyRef.current?.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)

        if(bodyPosition.z < - (blocksCount * 4 + 2)) end()
        if(bodyPosition.y < - 4) restart()
    })
  return (
    <RigidBody ref={bodyRef} canSleep={false} colliders="ball" restitution={0.2} friction={1} linearDamping={0.5} angularDamping={0.5} position={[0, 1, 0]}>
        <mesh castShadow>
            <icosahedronGeometry args={[0.3, 1]}/>
            <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
    </RigidBody>
  )
}
